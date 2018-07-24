/* eslint-disable strict, max-len */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const writeFile = require('write');
const yaml = require('js-yaml');
const util = require('util');
let argv = require('yargs').argv;
const handlebars = require('handlebars');

const configFolderPath = path.resolve("./", 'urbanCode');
const env = process.env.NODE_ENV || 'development';
const definitions = require(`${configFolderPath}/definitions.json`);

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
    'transformer': transformer,
    'convertToYAML' : convertToYAML,
    'replaceLiteralTokens': replaceLiteralTokens
}