const fs = require('fs');
const config = {
    logDir: process.env.LOG_DIR || 'logs'
};

function log(requestData, responseData){
    const {logDir} =  config;
    const request = {
        'url': requestData.hostURL + requestData.endPointPath,
        'http-method': requestData.httpMethod,
        'headers': requestData.requestHeader,
        'body': requestData.requestPayload
    };

    const response = {
        'httpStatusCode' : responseData.statusCode,
        'body': responseData.body,
        'headers': responseData.headers
    };

    const str = 'Request Data ==================================\n'+ JSON.stringify(request, null, 2) +
    '\n\nResponse Data ==================================\n'+JSON.stringify(response, null, 2) +
    '\n\n***************************************End********************************************\n\n';
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    fs.appendFileSync(`${logDir}/executionLog.txt`, str, {encoding:'utf8', mode:0o666});
}

module.exports = {
    log
};
