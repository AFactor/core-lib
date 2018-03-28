const fs = require('fs');

function log(requestData, responseData){
    let request = {
        'url': requestData.hostURL + requestData.endPointPath,
        'http-method': requestData.httpMethod,
        'headers': requestData.requestHeader,
        'body': requestData.requestPayload
    };

    let response = {
        'httpStatusCode' : responseData.statusCode,
        'body': responseData.body,
        'headers': responseData.headers
    };
    let str = 'Request Data ==================================\n'+ JSON.stringify(request, null, 2) +
    '\n\nResponse Data ==================================\n'+JSON.stringify(response, null, 2) +
    '\n\n***************************************End********************************************\n\n';
    const logDir = 'logs';
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    fs.appendFileSync('logs/executionLog.txt', str, {encoding:'utf8', mode:0o666});
}

module.exports = {
    log
};
