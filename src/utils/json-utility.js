const {
    some,
    isEqual
} = require('lodash');
const jsYaml = require('js-yaml');

module.exports = {
    isJSONObjectSubset: (object1, object2) => {
        return some(object2, (val, key) => isEqual(val, object1[key]));
    },

    yamlToJson: (yamlString) => {
        try {
            return jsYaml.safeLoad(yamlString);
        } catch(err){
            console.log(err);
        }
    }
};
