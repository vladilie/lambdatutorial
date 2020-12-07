let Client = require('ssh2-sftp-client');
const AWS = require('aws-sdk');
const stream = require('stream');

let sftp = new Client();
let s3 = new AWS.S3({region: 'eu-west-2'});

let sftp_config = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD
}

exports.ftpsScheduledEventLoggerHandler = async function (event) {
    const s3_pass = new stream.PassThrough();

    return new Promise((resolve, reject) => {
        sftp
            .connect(sftp_config)
            .then(() => {
                // list of files in testServer
                console.log("sftp pipe to s3");
                return sftp.get(process.env.SFTP_FILE_PATH, s3_pass);
            })
            .then(() => {
                return s3.upload(
                    {
                        Bucket: process.env.BUCKET_NAME,
                        Key: process.env.SFTP_FILE_PATH,
                        Body: s3_pass,
                        ACL: "public-read",
                        ContentType: "application/json"
                    }).promise()
            })
            .then(() => {
                console.log("sftp end")
                resolve(200);
                return sftp.end();
            })
            .catch((err) => {
                console.error(err);
                reject(err)
            });
    });

}
