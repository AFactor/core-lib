const jsonLib = require('./utils/json-utility');
const swaggerLib = require('./utils/swagger-utility');
const expect = require('chai').expect;
const superTest = require('supertest');
const testDataManager = require('./test-data-manager');

describe('Validate the API response and swagger check', function(){
    it('GET-validate the API response with expected data @GET_DataValidation', function(done){
        const testData = testDataManager.data['GET_DataValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.get(testData.requestData.endPointPath)
                .set(testData.requestData.requestHeader)
                .expect(testData.expectedResponse.httpResponseStatusCode)
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

    it('GET-validate API response against the swagger definition @GET_SwaggerValidation', function(done){
        const testData = testDataManager.data['GET_SwaggerValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.get(testData.requestData.endPointPath)
                .set(testData.requestData.requestHeader)
                .expect(testData.expectedResponse.httpResponseStatusCode)
                .end(function(err, res){
                    // delete res.body['Data']['Permissions']
                    const swaggerObject = jsonLib.yamlToJson(testData.expectedSwagger);
                    swaggerLib.validateJSONResponseWithSwaggerTools(swaggerObject, `#/definitions/${testData.requestData.swaggerDefinitionName}`, res.body).then((isFlag) => {
                        if(isFlag){
                            expect(isFlag).to.be.true;
                            done();
                        } else {
                            done(new Error('Get-response validation failed against swagger'));
                        }
                    });
                });
    });

    it('PUT-should update account request data status @PUT_DataValidation', function(done){
        const testData = testDataManager.data['PUT_DataValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.put(testData.requestData.endPointPath)
            .set(testData.requestData.requestHeader)
            .send(testData.requestData.requestPayload)
            .expect(testData.expectedResponse.httpResponseStatusCode)
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

    it('PUT-should update account request data status @PUT_SwaggerValidation', function(done){
        const testData = testDataManager.data['PUT_SwaggerValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.put(testData.requestData.endPointPath)
            .set(testData.requestData.requestHeader)
            .send(testData.requestData.requestPayload)
            .expect(testData.expectedResponse.httpResponseStatusCode)
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

    it('Post-create account request id @POST_DataValidation', function(done){
        const testData = testDataManager.data['POST_DataValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.post(testData.requestData.endPointPath)
            .set(testData.requestData.requestHeader)
            .send(testData.requestData.requestPayload)
            .expect(testData.expectedResponse.httpResponseStatusCode)
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

    it('Post-create account request id @POST_SwaggerValidation', function(done){
        const testData = testDataManager.data['POST_SwaggerValidation'];
        const server = superTest.agent(testData.requestData.hostURL);
        server.post(testData.requestData.endPointPath)
            .set(testData.requestData.requestHeader)
            .send(testData.requestData.requestPayload)
            .expect(testData.expectedResponse.httpResponseStatusCode)
            .end(function(err, res){
                const swaggerObject = jsonLib.yamlToJson(testData.expectedSwagger)
                swaggerLib.validateJSONResponseWithSwaggerTools(swaggerObject, `#/definitions/${testData.requestData.swaggerDefinitionName}`, res.body).then((isFlag) => {
                    if(isFlag){
                        expect(isFlag).to.be.true;
                        done();
                    } else {
                        done(new Error("response validation failed against swagger"));
                    }                        
                })
            })
    });
    
});