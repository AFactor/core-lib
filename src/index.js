
//Importing all the functions from helper folder
const { replaceTokens } = require('../helper/replaceTokens.js');
const { setupApis } = require('../helper/setupApis.js');
const { setupProducts } = require('../helper/setupProducts.js');
const { publishProducts } = require('../helper/publishProducts.js');


// Setup --- for creating definitions folder containing the yaml

// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json

// publish products -- to publish the products



module.exports = {
    'replaceTokens': replaceTokens,
    'publishProducts': publishProducts,
    'setupApis': setupApis,
    'setupProducts': setupProducts
};
