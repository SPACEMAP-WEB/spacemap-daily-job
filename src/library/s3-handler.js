const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');
const { asyncWriteFile } = require('./async-io');

class S3Handler {
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
  }

  async uploadFile(localFilePath, s3FileName) {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: 'spacemap',
          ACL: 'public-read-write',
          Key: s3FileName,
          Body: fs.createReadStream(localFilePath),
        },
        {},
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        },
      );
    });
  }

  async uploadFiles(localFilePaths, s3FileNames) {
    return Promise.all(
      localFilePaths.map(async (_, index) => {
        return this.uploadFile(localFilePaths[index], s3FileNames[index]);
      }),
    );
  }

  async downloadFile(localTrajectoryFilePath, s3FileName) {
    return new Promise((resolve, reject) => {
      this.s3.getObject(
        {
          Bucket: 'spacemap',
          Key: s3FileName,
        },
        async (err, data) => {
          if (err) {
            reject(err);
          } else {
            const dirname = path.dirname(localTrajectoryFilePath);
            if (!fs.existsSync(dirname)) {
              fs.mkdirSync(dirname, { recursive: true });
            }
            await asyncWriteFile(localTrajectoryFilePath, data.Body.toString());
            resolve();
          }
        },
      );
    });
  }
}

module.exports = S3Handler;
