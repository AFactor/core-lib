/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
let argv = require('yargs').argv;
const util = require('util');
const yaml = require('js-yaml');
const handlebars = require('handlebars');
const chalk = require('chalk');
const encoding = 'utf-8';
const writeFile = require('write');

//Importing all the functions from helper folder 
const { replaceTokens , handleErrors, findUnreplacedTokens, replaceConfigTokens, findTokenDelimiters } = require('../helper/replaceTokens.js');
const { setupApis, loadDynamicConf, createApiFile } = require('../helper/setupApis.js');
const { setupProducts, replaceLiteralTokens, transformer, createProductFiles, convertToYAML } = require('../helper/setupProducts.js');
const { publishProducts , publishProductCatalog } = require('../helper/publishProducts.js');



// Setup --- for creating definitions folder containing the yaml 

// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json

// publish products -- to publish the products



module.exports = {
    'replaceTokens': replaceTokens,
    'publishProducts': publishProducts,
    'setupApis': setupApis,
    'setupProducts': setupProducts
};