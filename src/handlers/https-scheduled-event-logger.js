const https = require('https');
const AWS = require('aws-sdk');
let s3 = new AWS.S3({region: 'eu-west-2'});

exports.httpsScheduledEventLoggerHandler = async function(event) {
    console.log('A Test')
    const promise = new Promise(function(resolve, reject) {
        https.get(
            process.env.HTTPS_URL,
            {
                rejectUnauthorized: process.env.VALIDATE_CERTIFICATES != 0
            },
            (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);

                if (200 == res.statusCode) {
                    s3.upload({
                        Body: res,
                        Bucket: process.env.BUCKET_NAME,
                        Key: "test.csv",
                        ACL: "public-read",
                        ContentType: "application/json"
                    });
                }

            }).on('end', () => {
                console.log("http done");
                resolve(200)
            }).on('error', (e) => {
                console.error(e);
                reject(e)
            });
    })
    return promise
}
