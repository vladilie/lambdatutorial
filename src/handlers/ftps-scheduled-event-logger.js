let Client = require('ssh2-sftp-client');
let sftp = new Client();

exports.ftpsScheduledEventLoggerHandler = async function(event) {
    const promise = new Promise(function (resolve, reject) {
        sftp.connect({
            host: process.env.SFTP_HOST,
            port: process.env.SFTP_PORT,
            username: process.env.SFTP_USER,
            password: process.env.SFTP_PASSWORD
        }).then((data) => {
            console.log("SFTP CONNECTED -> PROCESSING" + process.env.SFTP_FILE_PATH)
            console.log(data)
            sftp.get(process.env.SFTP_FILE_PATH, (stream) => {
                stream.pipeTo(process.stdout);
            }).catch((err) => {
                console.log(err, 'get error');
                reject(err)
            }).finally(() => {
                resolve(200)
            });
        }).catch((err) => {
            console.log(err, 'catch error');
            reject(err)
        }).finally(() => {
            sftp.end()
        });
        return promise
    });
}
