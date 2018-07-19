/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
let argv = require('yargs').argv;
const util = require('util');
const yaml = require('js-yaml');
const handlebars = require('handlebars');
const env = process.env.NODE_ENV || 'development';
const apicOrg = process.env.APIC_ORG || 'prototype';
const apicServer = process.env.APIC_SERVER || 'management01.psd2.sandbox.extranet.group'; 
const shell = require('shelljs');
const chalk = require('chalk');
const encoding = 'utf-8';
const divider = '\n------------------------------------------------------------------------------------------------';
const exec = require('child_process').exec;
const logger = require('fancy-log');
const writeFile = require('write');
const merge = require('lodash').merge;

//Importing all the functions from helper folder 
const { handleErrors, findUnreplacedTokens, replaceConfigTokens, findTokenDelimiters } = require('../helper/replaceTokens.js');
const { loadDynamicConf, createApiFile , replaceLiteralTokens , transformer, createProductFiles , convertToYAML } = require('../helper/setupApis.js');

const utilOpts = {depth: 15, colors: true, compact: false};
const definitionsFolder = './definitions';
const configFolderPath = path.resolve("./",'urbanCode');
const catalogs = require(`${configFolderPath}/catalogs.json`);
const delimiter = '&&';
const delimeterRegex = new RegExp(`${delimiter}.*?${delimiter}`, 'g');
const tokenRegex = new RegExp(`${delimiter}(.*?)${delimiter}`, 'g');
const definitions = require(`${configFolderPath}/definitions.json`);
const productSettings = require(`${configFolderPath}/products.json`);
const apiValues = require(`${configFolderPath}/apis.json`);
let tokenValues = {};

// console.log("./ absolutepath", path.resolve("./",'pipelines/conf/job-configuration.json'));
try {
  tokenValues = require(path.resolve("./",'pipelines/conf/job-configuration.json')).environments.master.tokens;
} catch (e) {
  console.warn('Couldn\'t require tokens. If this is not a local environment then it\'s fine.', e.message);
}

function publishProducts() {
  console.log('apicServer', apicServer);
  console.log('apicOrg', apicOrg);
  for (let catalog in catalogs) {
    console.log('catalog1',catalog);
    if (!Array.isArray(catalogs[catalog])) {
      console.log('catalog2',catalog);
      for (let space in catalogs[catalog]) {
        console.log('catalog3',space);
        if (shell.exec(`apic config:set space=apic-space://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}/spaces/${space}`).code === 0) {
          for (let product of catalogs[catalog][space]) {
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product} --scope space`).code !== 0) {
              logger(`Error: publishing product ${product}`);
              shell.exec(`cat ${product}`);
              // shell.exec('definitions/account-information-internal-bos.yaml');
              return shell.exit(1);
            }
            logger(`publishing product ${product} finished`);
            shell.exec(`sleep ${tts}`);
          }
        } else {
          logger(`Error: setting space to ${space} in catalog ${catalog} and organisation - ${apicOrg}`);
          return shell.exit(1);
        }
      }
    } else {
      if (shell.exec(`apic config:set catalog=apic-catalog://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}`).code === 0) {
        for (let product of catalogs[catalog]) {
          logger(`publishing product ${product} started`);
          if (shell.exec(`apic publish -s ${apicServer} ${product}`).code !== 0) {
            logger(`Error: publishing product ${product}`);
            return shell.exit(1);
          }
          logger(`publishing product ${product} finished`);
          shell.exec(`sleep ${tts}`);
        }
      } else {
        logger(`Error: setting catalog to ${catalog} in organisation - ${apicOrg}`);
        return shell.exit(1);
      }
    }
  }
};

// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json
function replaceTokens() {
  fs.readdir(definitionsFolder, (err, files) => {
    if (!err) {
      // Iterating through all the files inside definitionsFolder folder
      files.forEach(file => {
        file = `./definitions/${file}`; // appending correct path
        fs.readFile(file, { encoding: 'utf-8' }, function(err, data) {
          if (!err) {
            if (argv.debug) {
              console.log('findTokenDelimiters(data)', findTokenDelimiters(data));
            }
            // Run processing
            if (findTokenDelimiters(data)) {
              data = replaceConfigTokens(data, tokenValues, file);
              // console.log("data", data);
              let errors = findUnreplacedTokens(data.split(/\r?\n/));
              if (errors.length) {
                handleErrors(errors, file); // Will report errors then throw an exception and stop the process.
              } else {
                if (argv.debug) {
                  console.log(chalk.green('No rogue tokens found'));
                }
              }
            }
            // Replace file contents with treated string and return file
            fs.writeFile(file, data, 'utf8', function(err) {
              if (err) return console.log(err);
            });
          } else {
            console.log(err);
          }
        });
      });
    }
    else{
      console.log('definitions folder has not been made!! Run npm run setup to update the definitions folder');
    }
  });
};

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
  'setupApis' : setupApis,
  'setupProducts': setupProducts
};

