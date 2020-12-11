const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'eu-west-2'});
const Client = require('ssh2').Client;
const conn = new Client();
const { PassThrough } = require('stream');

let sftp_config = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
    algorithms: {
        cipher: [
            'aes128-ctr',
            'aes192-ctr',
            'aes256-ctr',
            'aes128-gcm',
            'aes128-gcm@openssh.com',
            'aes256-gcm',
            'aes256-gcm@openssh.com',
            'aes256-cbc'
        ]
    }
}

exports.sftpScheduledEventLoggerHandler = async function(event) {
    console.log(process.env.SFTP_FILE_PATH)
    const promise = new Promise(function(resolve, reject) {
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                const transferStream = new PassThrough();

                s3.upload({
                    Bucket: process.env.BUCKET_NAME,
                    Key: process.env.SFTP_FILE_PATH,
                    Body: transferStream,
                    ACL: "public-read",
                    CacheControl: "5184000"
                }, (err, data) => {
                    if (err) {
                        console.log(`Upload error: ${err}`);
                        reject(err)
                        return
                    }
                    if (data) {
                        console.log(`Uploaded to [${data.Location}].`);
                        transferStream.end();
                        conn.end();
                        resolve(200)
                    }
                });

                sftp.createReadStream(process.env.SFTP_FILE_PATH)
                    .pipe(transferStream)
                    .on('end', () => {
                        console.log("created Read Stream");
                    })
                    .on('error', () => {
                        reject(err)
                        return
                    });
            });
        }).connect(sftp_config);
    });
    return promise
}


