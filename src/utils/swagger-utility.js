const spec = require('swagger-tools').specs.v2;

module.exports = {
    validateJSONResponseWithSwaggerTools: (swaggerObject, modelDefinition, jsonResonse) => {
        return new Promise((resolve, reject) => {
            spec.validateModel(swaggerObject, modelDefinition, jsonResonse, function(err, result){
                if(result){
                    console.log('Swagger model failed validation:');
                    result.errors.forEach(function (err) {
                        console.error('#/' + err.path.join('/') + ': ' + err.message);
                      });
                     resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
};
