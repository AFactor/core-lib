const testRunner = require('../src/index');
const fs = require('fs');

const path = './test/data/swagger/account-request-data-api-swagger.yaml';
let expectedSwagger = fs.readFileSync(path, 'utf8');

// Get request
requestData = require('./data/request-test-data/get-request.json');
expectedResponse = require('./data/request-expected-data/get-request-expected-response.json') ;
testRunner.addTest('DATA_VALIDATION', {requestData, expectedResponse});
testRunner.addTest('SWAGGER_VALIDATION', {requestData, expectedSwagger, expectedResponse});

//Post request
requestData = require('./data/request-test-data/post-request.json');
expectedResponse = require('./data/request-expected-data/post-request-expected-response.json');
testRunner.addTest('DATA_VALIDATION', {requestData, expectedResponse});
testRunner.addTest('SWAGGER_VALIDATION', {requestData, expectedSwagger, expectedResponse});

// PUT request
requestData = require('./data/request-test-data/put-request.json');
expectedResponse = require('./data/request-expected-data/put-request-expected-response.json');
testRunner.addTest('DATA_VALIDATION', {requestData, expectedResponse});
testRunner.addTest('SWAGGER_VALIDATION', {requestData, expectedSwagger, expectedResponse});

testRunner.run();
