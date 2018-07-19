/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
let argv = require('yargs').argv;
const env = process.env.NODE_ENV || 'development';
const chalk = require('chalk');
const exec = require('child_process').exec;

const divider = '\n------------------------------------------------------------------------------------------------';
const delimiter = '&&';
const delimeterRegex = new RegExp(`${delimiter}.*?${delimiter}`, 'g');
const tokenRegex = new RegExp(`${delimiter}(.*?)${delimiter}`, 'g');
let tokenValues = {};


// UTILITY FUNCTIONS
// Logs out errors; throws an exception at the end to avoid bad files being written to disc.

function handleErrors(errors, file) {
    console.log(chalk.red(`The following tokens were not replaced in ${file}`));
    errors.forEach(err => {
        let tokenListString = '';
        err.tokens.forEach((token, i, arr) => {
            tokenListString += `'${token}'`;
            if (i < arr.length - 1) {
                if (i === arr.length - 2) {
                    tokenListString += ' and ';
                } else {

                    tokenListString += ', ';
                }
            }
        });
        console.log(chalk.red(`${tokenListString} ${errors.length > 1 ? 'were' : 'was'} found on line ${err.lineNo}`));
    });
    //throw new Error('Unreplaced tokens found');
    console.log(chalk.magenta(divider));
};

// Looks for tokens which have not been replaced
function findUnreplacedTokens(lines) {
    if (argv.debug) {
        console.log(chalk.cyan('Scanning for unreplaced tokens...'));
    }
    const errors = [];
    lines.forEach((line, i) => {
        let foundTokens;
        const uTokens = [];
        while ((foundTokens = delimeterRegex.exec(line)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (foundTokens.index === delimeterRegex.lastIndex) {
                delimeterRegex.lastIndex++;
            }
            uTokens.push(foundTokens[0]);
        }
        if (uTokens.length) {
            errors.push({
                tokens: uTokens,
                lineNo: i + 1,
            });
        }
    });
    return errors;
};

function replaceConfigTokens(str, tokenValues, fileName) {
    if (argv.debug) {
        console.log(chalk.cyan('About to replace tokens'));
    }
    str = str.replace(tokenRegex, match => {
        const tokenName = match.replace(/&&/g, '').trim();
        const tokenValue = tokenValues[tokenName];
        if (tokenValue) {
            if (argv.debug) {

                console.log(`Replacing '${match}' with '${tokenValue}'`);
            }
            return tokenValue;
        }
        if (argv.debug) {
            // If not found in tokens then return the match to be found later
            console.warn(chalk.yellow(`WARNING: '${match}' was not replaced in ${fileName}. No match was found.`));
        }
        return match;
    });
    if (argv.debug) {
        console.log(chalk.yellow('Replacing tokens procedure complete.'));
    }
    return str;
};

function findTokenDelimiters(str) {
    const delimitersFound = delimeterRegex.test(str);
    if (delimitersFound) {
        if (argv.debug) {
            console.log(chalk.cyan('File has token delimiters in it.'));
        }
        return true;
    }
    if (argv.debug) {
        console.log(chalk.green('File has no token delimiters present.'));
    }
    return false;
};



module.exports = {
  'handleErrors' : handleErrors,
  'findUnreplacedTokens' : findUnreplacedTokens,
  'replaceConfigTokens' : replaceConfigTokens,
  'findTokenDelimiters' : findTokenDelimiters
}