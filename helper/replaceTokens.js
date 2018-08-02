/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
let argv = require('yargs').argv;
const chalk = require('chalk');

const divider = '\n------------------------------------------------------------------------------------------------';
const delimiter = '&&';
const delimeterRegex = new RegExp(`${delimiter}.*?${delimiter}`, 'g');
const tokenRegex = new RegExp(`${delimiter}(.*?)${delimiter}`, 'g');
const definitionsFolder = './definitions';
const catalog = path.resolve('./', 'urbanCode/catalogs.json');
let tokenValues = {};

try {
    tokenValues = require(path.resolve('./', 'pipelines/conf/job-configuration.json')).environments.master.tokens;
} catch (e) {
    console.warn('Couldn\'t require tokens. If this is not a local environment then it\'s fine.', e.message);
}

// Replace tokens ---- replaces the variables value in the defintion folder yamls to the values from tokens present in job-configuration.json
function replaceTokens() {
    // Replace token in definition folder
    fs.readdir(definitionsFolder, (err, files) => {
        if (!err) {
            // Iterating through all the files inside definitionsFolder folder
            files.forEach(file => {
                file = `./definitions/${file}`; // appending correct path
                replaceTokenValue(file);
            });
        } else {
            console.log('definitions folder has not been made!! Run npm run setup to update the definitions folder');
        }
    });
    // Replace token in catalog.json
    replaceTokenValue(catalog);
};

function replaceTokenValue(file) {
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
                } else if (argv.debug) {
                    console.log(chalk.green('No rogue tokens found'));
                }
            }
            // Replace file contents with treated string and return file
            fs.writeFile(file, data, 'utf8', function(err) {
                if (err) {
                    return console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });
}

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
    'replaceTokens': replaceTokens
};
