const AWS = require('aws-sdk');
const fs = require('fs');

class S3Handler {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
  }

  async uploadTleFile(localTleFilePath, s3FileName) {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: 'spacemap',
          Key: `tles/${s3FileName}`,
          Body: fs.createReadStream(localTleFilePath),
        },
        {},
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }
}

module.exports = S3Handler;
