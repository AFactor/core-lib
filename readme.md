# Getting Started
1. Install the following npm module
    ``` npm install apie-test-automation-lib --save ```
2. Require the project in your test.js file
   ``` const runner = require('apie-test-automation-lib'); ```
3. Add the test to the runner by calling 'addTest()' function. Please see below the options.
### Test Scenerios
By default we supports data validation and swagger validation of API resposne.
#### 1. Data Validation
* GET 
```runner.addTest('GET_DataValidation', {requestData, expectedResponse});```
* POST
```runner.addTest('POST_DataValidation', {requestData, expectedResponse});```
* PUT
```runner.addTest('PUT_DataValidation', {requestData, expectedResponse});```
### 2. Swagger Validation
* GET
```runner.addTest('GET_SwaggerValidation', {requestData, expectedSwagger, expectedResponse});```
* POST
```runner.addTest('POST_SwaggerValidation', {requestData, expectedSwagger, expectedResponse});```
* PUT
```runner.addTest('PUT_SwaggerValidation', {requestData, expectedSwagger, expectedResponse});```

    **Note:- expectedSwagger should be yaml string**
### Run Test    
After adding all the test, call the following method to run the test:-
``` runner.run(); ```

**For more details, please check test/caller.js file**
