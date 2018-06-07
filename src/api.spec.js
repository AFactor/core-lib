process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
const jsonDiff = require('json-diff');
const expect = require('chai').expect;
const superTest = require('supertest');
const jsonLib = require('./utils/json-utility');
const swaggerLib = require('./utils/swagger-utility');
const logger = require('./utils/logger-utility');
const testDataManager = require('./test-data-manager');
describe('Validate the API response and swagger check', function(){
    testDataManager.data['DATA_VALIDATION'].forEach(testData => {
        it('Validate the API response with expected data @DATA_VALIDATION', function(done){
            const server = superTest.agent(testData.requestData.hostURL);
            let intermediateRequest = server[testData.requestData.httpMethod.toLowerCase()](testData.requestData.endPointPath)
             .set(testData.requestData.requestHeader);
            if (testData.requestData.requestPayload){
                intermediateRequest = intermediateRequest.send(testData.requestData.requestPayload);
            }
            intermediateRequest.expect(testData.expectedResponse.httpResponseStatusCode)
                    .end(function(err, res){
                        const actualResBody = testData.expectedResponse.responseBodyAttributeName ?
                        res.body[testData.expectedResponse.responseBodyAttributeName] : res.body;
                        if (err) {
                            logger.log(testData.requestData, res);
                        }
                        const isSubset = jsonLib.isJSONObjectSubset(actualResBody, testData.expectedResponse.responseBody.body);
                            if (isSubset){
                                expect(isSubset).to.be.true;
                                done();
                            } else {
                                console.log(jsonDiff.diffString(testData.expectedResponse.responseBody.body, actualResBody));
                                done(new Error('expected response does not match with actual response'));
                            }
                    });
        });
    });

    testDataManager.data['SWAGGER_VALIDATION'].forEach(testData => {
        it('Validate API response against the swagger definition @SWAGGER_VALIDATION', function(done){
            const server = superTest.agent(testData.requestData.hostURL);
            let intermediateRequest = server[testData.requestData.httpMethod.toLowerCase()](testData.requestData.endPointPath)
                    .set(testData.requestData.requestHeader);
            if (testData.requestData.requestPayload){
                intermediateRequest = intermediateRequest.send(testData.requestData.requestPayload);
            }
            intermediateRequest.expect(testData.expectedResponse.httpResponseStatusCode)
                    .end(function(err, res){
                        const swaggerObject = jsonLib.yamlToJson(testData.expectedSwagger);
                        const actualResBody = testData.expectedResponse.responseBodyAttributeName ?
                        res.body[testData.expectedResponse.responseBodyAttributeName] : res.body;
                        if (err) {
                            logger.log(testData.requestData, res);
                        }
                        swaggerLib.validateJSONResponseWithSwaggerTools(swaggerObject, `#/definitions/${testData.requestData.swaggerDefinitionName}`, actualResBody).then((isFlag) => {
                            if(isFlag){
                                expect(isFlag).to.be.true;
                                done();
                            } else {
                                done(new Error('response validation failed against swagger'));
                            }
                        });
                    });
        });
    });

    testDataManager.data['HEADER_VALIDATION'].forEach(testData => {
        it('Validate the API response headers with expected data @HEADER_VALIDATION', function(done){
            const server = superTest.agent(testData.requestData.hostURL);
            let intermediateRequest = server[testData.requestData.httpMethod.toLowerCase()](testData.requestData.endPointPath)
             .set(testData.requestData.requestHeader);
            if (testData.requestData.requestPayload){
                intermediateRequest = intermediateRequest.send(testData.requestData.requestPayload);
            }
            intermediateRequest.expect(testData.expectedResponse.httpResponseStatusCode)
                    .end(function(err, res){
                        const actualResHeaders = testData.expectedResponse.responseHeaderAttributeName ?
                        res.body[testData.expectedResponse.responseHeaderAttributeName] : res.headers;
                        if (err) {
                            logger.log(testData.requestData, res);
                        }
                        const expectedResHeaders = testData.expectedResponse.responseBody.headers;
                        for(let key in expectedResHeaders){
                            if (!expectedResHeaders[key].hasOwnProperty('RegEx')){
                                expect(actualResHeaders[key]).to.equal(expectedResHeaders[key]);
                            } else {
                                expect(actualResHeaders[key]).to.match(new RegExp(expectedResHeaders[key]['RegEx']));
                            }
                        }
                        done();
                    });
        });
    });
});
