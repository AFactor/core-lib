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
const { loadDynamicConf, createApiFile, replaceLiteralTokens, transformer, createProductFiles, convertToYAML } = require('../helper/setupApis.js');
const { publishProducts , publishProductCatalog } = require('../helper/publishProducts.js');

const utilOpts = { depth: 15, colors: true, compact: false };
const configFolderPath = path.resolve("./", 'urbanCode');
const definitions = require(`${configFolderPath}/definitions.json`);
const productSettings = require(`${configFolderPath}/products.json`);



// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json


// Setup --- for creating definitions folder containing the yaml
function setupProducts() {
    const productDefinitions = definitions.products;
    for (let definition in productDefinitions) {
        const product = productDefinitions[definition];
        let configObj = product.configObj;
        const templateConf = product.templateConf;
        if (templateConf) {
            configObj = Object.assign({}, configObj, productSettings.productTemplates[templateConf].config);
        }
        const json = transformer(product.template, configObj);
        let outputYaml = convertToYAML(JSON.parse(json));
        outputYaml = replaceLiteralTokens(outputYaml);
        createProductFiles(product, outputYaml);
    }
}

function setupApis() {
    for (let definition in definitions.apis) {
        const apiDefinition = definitions.apis[definition];
        let apiConfig = yaml.safeLoad(fsExtra.readFileSync(path.resolve(definitions.apiDir, apiDefinition.swagger), 'utf8'));
        if (apiDefinition.templateConf) {
            try {
                apiConfig = loadDynamicConf(apiDefinition, apiConfig);
            } catch (e) {
                console.error(`Failed in API ${util.inspect(apiDefinition, utilOpts)} and the exception is ${util.inspect(e, utilOpts)}`);
                throw new Error('Failed in setup API');
            }
        }
        const securityDefinition = apiDefinition.security;
        if (securityDefinition) {
            const transformedOutput = JSON.parse(transformer(securityDefinition.template, securityDefinition.config));
            apiConfig.securityDefinitions = transformedOutput.securityDefinitions;
            apiConfig.security = transformedOutput.security;
        }
        createApiFile(apiDefinition.dest, apiConfig);
    }
}

module.exports = {
    'replaceTokens': replaceTokens,
    'publishProducts': publishProducts,
    'setupApis': setupApis,
    'setupProducts': setupProducts
};