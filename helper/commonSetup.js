/* eslint-disable strict, max-len */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const writeFile = require('write');
const yaml = require('js-yaml');
const util = require('util');
const handlebars = require('handlebars');

const configFolderPath = path.resolve("./", 'urbanCode');
const env = process.env.NODE_ENV || 'development';
const definitions = require(`${configFolderPath}/definitions.json`);
const catalogs = require(`${configFolderPath}/catalogs.json`);

function createDeployableProducts() {
  let deployableProducts = [];
  for (let catalog in catalogs) {
    if (!Array.isArray(catalogs[catalog])) {
      for (let product in catalogs[catalog]) {
        let products = catalogs[catalog][product];
        products = products.filter(product => product.deploy === true)
          .map(product =>
            product.productName && product.productName.split('/')[1]
          );
          deployableProducts = [...products, ...deployableProducts];

      }
    } else {
      let products = catalogs[catalog];
      products = products.filter(product => product.deploy === true)
        .map(product =>
          product.productName && product.productName.split('/')[1]
        );
        deployableProducts = [...products, ...deployableProducts];
    }
  }
  // if no product to be published break the flow
  if(!deployableProducts.length){
    throw new Error('No product to be published'); 
  }

  // returning the name of the filtered products to be published
  return deployableProducts;
}

function transformer(input, configObj) {
  const template = typeof input === 'object' ? JSON.stringify(input) : fsExtra.readFileSync(path.resolve(definitions.templateDir, input)).toString();
  const _template = handlebars.compile(template);
  const output = _template(configObj);
  return output;
}

function convertToYAML(json) {
  return yaml.dump(json);
}

function replaceLiteralTokens(str) {
  return str
    .replace(/\$\&\&/gi, '&&')
    .replace(/\$\&\&/gi, '&&');
}

module.exports = {
  'createDeployableProducts': createDeployableProducts,
  'transformer': transformer,
  'convertToYAML': convertToYAML,
  'replaceLiteralTokens': replaceLiteralTokens
}
