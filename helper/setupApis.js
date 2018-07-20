/* eslint-disable strict, max-len */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const writeFile = require('write');
const yaml = require('js-yaml');
let argv = require('yargs').argv;
const handlebars = require('handlebars');
const merge = require('lodash').merge;

const configFolderPath = path.resolve("./",'urbanCode');
const env = process.env.NODE_ENV || 'development';
const definitions = require(`${configFolderPath}/definitions.json`);
const apiValues = require(`${configFolderPath}/apis.json`);

function loadDynamicConf(apiDefinition, apiConfig) {
  const inputData = apiDefinition.src;
  const templateConfObj = apiValues[apiDefinition.templateConf].config;
  const configObj = Object.assign({}, apiDefinition, templateConfObj);
  const merged = transformer(inputData, configObj);
  const transformedOutput = yaml.safeLoad(merged);
  const dynamicConf = merge({}, apiConfig, transformedOutput);
  return dynamicConf;
}

function createApiFile(name, config) {
  const filePath = path.resolve(definitions.outputDir, name);
  const yamlObj = convertToYAML(config);
  const finalYamlObj = replaceLiteralTokens(yamlObj);
  writeFile.sync(filePath, finalYamlObj);
}

function replaceLiteralTokens(str) {
    return str
        .replace(/\$\&\&/gi, '&&')
        .replace(/\$\&\&/gi, '&&');
}

function transformer(input, configObj) {
  const template = typeof input === 'object' ? JSON.stringify(input) : fsExtra.readFileSync(path.resolve(definitions.templateDir, input)).toString();
  const _template = handlebars.compile(template);
  const output = _template(configObj);
  return output;
}


function createProductFiles(productObj, outputYaml) {
  let filePath = path.resolve(definitions.outputDir, productObj.filename);
  writeFile.sync(filePath, outputYaml);
}

function convertToYAML(json) {
  return yaml.dump(json);
}


//fsExtra.removeSync(definitions.outputDir); // delete definitions folder before creating yamls


module.exports = {
  'loadDynamicConf' : loadDynamicConf,
  'createApiFile' : createApiFile,
  'replaceLiteralTokens' : replaceLiteralTokens,
  'transformer' : transformer,
  'createProductFiles' :createProductFiles,
  'convertToYAML' :convertToYAML
}