const https = require('https')

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

                res.on('data', (d) => {
                    process.stdout.write(d);
                    resolve(res.statusCode)
                });

            }).on('error', (e) => {
                console.error(e);
                reject(e)
            });
    })
    return promise
}
