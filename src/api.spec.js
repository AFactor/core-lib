const jsonLib = require('./utils/json-utility');
const swaggerLib = require('./utils/swagger-utility');
const expect = require('chai').expect;
const superTest = require('supertest');
const testDataManager = require('./test-data-manager');

describe('Validate the API response and swagger check', function(){
    testDataManager.data['DataValidation'].forEach(testData => {
        it('Validate the API response with expected data @DataValidation', function(done){
            const server = superTest.agent(testData.requestData.hostURL);
            let intermediateRequest = server[testData.requestData.httpMethod.toLowerCase()](testData.requestData.endPointPath)
             .set(testData.requestData.requestHeader);
            if (testData.requestData.requestPayload){
                intermediateRequest = intermediateRequest.send(testData.requestData.requestPayload);
            }
            intermediateRequest.expect(testData.expectedResponse.httpResponseStatusCode)
                    .end(function(err, res){
                        jsonLib.isJSONObjectSubset(res.body, testData.expectedResponse.payload).then((isSubset) => {
                            if (isSubset){
                                expect(isSubset).to.be.true;
                                done();
                            } else {
                                done(new Error('expected response does not match with actual response'));
                            }
                        });
                    });
        });
    });

    testDataManager.data['SwaggerValidation'].forEach(testData => {
        it('Validate API response against the swagger definition @SwaggerValidation', function(done){
            const server = superTest.agent(testData.requestData.hostURL);
            let intermediateRequest = server[testData.requestData.httpMethod.toLowerCase()](testData.requestData.endPointPath)
                    .set(testData.requestData.requestHeader);
            if (testData.requestData.requestPayload){
                intermediateRequest = intermediateRequest.send(testData.requestData.requestPayload);
            }
            intermediateRequest.expect(testData.expectedResponse.httpResponseStatusCode)
                    .end(function(err, res){
                        const swaggerObject = jsonLib.yamlToJson(testData.expectedSwagger);
                        swaggerLib.validateJSONResponseWithSwaggerTools(swaggerObject, `#/definitions/${testData.requestData.swaggerDefinitionName}`, res.body).then((isFlag) => {
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
});
