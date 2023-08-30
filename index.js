const crypto = require('crypto');
const localData = require('./local'); 
const cloudData = require('./cloud'); 

const batchSize = localData.length / 5; 

const hashAlgorithm = 'sha256'; 

localData.sort((a, b) => a.id - b.id);
cloudData.sort((a, b) => a.id - b.id);
if( localData.length !== cloudData.length)
{
  console.log("Data is not transferred completly!");
}
else{
  async function generateHash(data) {
    const hash = crypto.createHash(hashAlgorithm);
    hash.update(data);
    return hash.digest('hex');
  }
  
  async function main() {
    let offset = 0;
    let flag = false;
    let count = 0;
    
  
    // ensures that all the data is verified and the loop exits only when the data from both the side is finished.
    while (offset < localData.length) {
      const localBatch = localData.slice(offset, offset + batchSize);
      const cloudBatch = cloudData.slice(offset, offset + batchSize);
  
      if (localBatch.length !== cloudBatch.length) {
        console.log('Data batch size doesnt match');
      }
  
      const localBatchSorted = localBatch.map(item => sortObject(item));
      const cloudBatchSorted = cloudBatch.map(item => sortObject(item));
  
       const localBatchString = JSON.stringify(localBatchSorted);
      const cloudBatchString = JSON.stringify(cloudBatchSorted);
  
      const localBatchHash = await generateHash(localBatchString);
      const cloudBatchHash = await generateHash(cloudBatchString);
  
      if (localBatchHash !== cloudBatchHash) {
        flag = true;
        count++;
      }
  
      offset += batchSize;
    }
  
    if (flag) {
      console.log(count);
      console.log(`Data verification failed with ${count} errors`);
    } else {
      console.log('Data verification successful without mismatches');
    }
  
    console.log('Exiting the function...');
  }
  
  // Here we sort the object to ensure that even if the order of the data in the object is changed it won't affect the hash value.
  
  function sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
        sortedObj[key] = obj[key];
        return sortedObj;
      }, {});
  }
  main().catch(err => console.error('Error:', err));
  }