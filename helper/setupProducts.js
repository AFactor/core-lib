/* eslint-disable strict, max-len */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const writeFile = require('write');
const yaml = require('js-yaml');
let argv = require('yargs').argv;
const handlebars = require('handlebars');
const merge = require('lodash').merge;

const { transformer , convertToYAML , replaceLiteralTokens } = require('../helper/commonSetup.js');

const configFolderPath = path.resolve("./",'urbanCode');
const env = process.env.NODE_ENV || 'development';
const definitions = require(`${configFolderPath}/definitions.json`);
const apiValues = require(`${configFolderPath}/apis.json`);
const utilOpts = { depth: 15, colors: true, compact: false };
const productSettings = require(`${configFolderPath}/products.json`);


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



function createProductFiles(productObj, outputYaml) {
  let filePath = path.resolve(definitions.outputDir, productObj.filename);
  writeFile.sync(filePath, outputYaml);
}


//fsExtra.removeSync(definitions.outputDir); // delete definitions folder before creating yamls


module.exports = {
  'setupProducts' : setupProducts
}