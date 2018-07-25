
//Importing all the functions from helper folder 
const { replaceTokens , replaceTokenValue , handleErrors, findUnreplacedTokens, replaceConfigTokens, findTokenDelimiters } = require('../helper/replaceTokens.js');
const { setupApis, loadDynamicConf, createApiFile } = require('../helper/setupApis.js');
const { setupProducts, replaceLiteralTokens, transformer, createProductFiles, convertToYAML } = require('../helper/setupProducts.js');
const { publishProducts , publishProductWithSpace , publishProductWithoutSpace } = require('../helper/publishProducts.js');


// Setup --- for creating definitions folder containing the yaml 

// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json

// publish products -- to publish the products



module.exports = {
    'replaceTokens': replaceTokens,
    'publishProducts': publishProducts,
    'setupApis': setupApis,
    'setupProducts': setupProducts
};