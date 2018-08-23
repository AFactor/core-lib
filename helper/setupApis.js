/* eslint-disable strict, max-len */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const writeFile = require('write');
const util = require('util');
const yaml = require('js-yaml');
let argv = require('yargs').argv;
const handlebars = require('handlebars');
const merge = require('lodash').merge;

const { transformer, convertToYAML, replaceLiteralTokens, createDeployableProducts } = require('../helper/commonSetup.js');

const configFolderPath = path.resolve("./", 'urbanCode');
const env = process.env.NODE_ENV || 'development';
const definitions = require(`${configFolderPath}/definitions.json`);
const apiValues = require(`${configFolderPath}/apis.json`);
const utilOpts = { depth: 15, colors: true, compact: false };
const productSettings = require(`${configFolderPath}/products.json`);


function setupApis() {
  fsExtra.removeSync(definitions.outputDir); // delete definitions folder before creating yamls
  let products = createDeployableProducts();
  createApis(products);
}

function createApis(products) {
  let scripts = loadGatewayScripts();
  products.forEach(function(product) {
    const apis = definitions.products.filter(publishProduct => publishProduct.filename === product).map(apisName => apisName.configObj.name).toString(),
    apisDefinitions = definitions.apis.filter(api => api.xIBMName === apis);
    
    for (let definition in apisDefinitions) {
      const apiDefinition = apisDefinitions[definition];
      let apiConfig = yaml.safeLoad(fsExtra.readFileSync(path.resolve(definitions.apiDir, apiDefinition.swagger), 'utf8'));
      if (apiDefinition.templateConf) {
        try {
          apiConfig = loadDynamicConf(apiDefinition, apiConfig, scripts);
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
  });
}

function loadDynamicConf(apiDefinition, apiConfig, scripts) {
  const inputData = apiDefinition.src;
  const templateConfObj = apiValues[apiDefinition.templateConf].config;
  const configObj = Object.assign({}, apiDefinition, templateConfObj);
  merge(configObj,scripts);
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

function loadGatewayScripts(){

  let script = require(path.resolve(definitions.gatewayScript));
  let UglifyJS = require("uglify-es");
  let funcs = {};
  for (var item in script) {
    //minify the func body
    var result = UglifyJS.minify(script[item].toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]);
    if(!result.error){
      funcs[item]=result.code;
    }else {
      throw(result.error);}
  }
  return funcs;

}

//fsExtra.removeSync(definitions.outputDir); // delete definitions folder before creating yamls


module.exports = {
  'setupApis': setupApis
}
