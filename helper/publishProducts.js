/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const apicOrg = process.env.APIC_ORG || 'apigateway-dev';
const apicServer = process.env.APIC_SERVER || 'management01.psd2.sandbox.extranet.group';
const tts = process.env.tts || '0';
const shell = require('shelljs');
const exec = require('child_process').exec;
const logger = require('fancy-log');


const configFolderPath = path.resolve("./", 'urbanCode');
const catalogs = require(`${configFolderPath}/catalogs.json`);


function publishProducts() {
    for (let catalog in catalogs) {
        if (!Array.isArray(catalogs[catalog])) {
            for (let space in catalogs[catalog]) {
                if (shell.exec(`apic config:set space=apic-space://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}/spaces/${space}`).code === 0) {
                    const products = catalogs[catalog][space];
                    publishProductWithSpace(products, apicServer, apicOrg);
                } else {
                    logger(`Error: setting space to ${space} in catalog ${catalog} and organisation - ${apicOrg}`);
                    return shell.exit(1);
                }
            }
        } else {
            if (shell.exec(`apic config:set catalog=apic-catalog://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}`).code === 0) {
                publishProductWithoutSpace(catalog, apicServer, apicOrg);
            } else {
                logger(`Error: setting catalog to ${catalog} in organisation - ${apicOrg}`);
                return shell.exit(1);
            }
        }
    }
};

function publishProductWithSpace(products, apicServer, apicOrg) {
    for (let obj of products) {
        let product = obj.productName,
            isDeploy = obj.deploy || false;
        if (isDeploy === true) {
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product} --scope space`).code !== 0) {
                logger(`Error: publishing product ${product}`);
                shell.exec(`cat ${product}`);
                return shell.exit(1);
            }
            logger(`publishing product ${product} finished`);
            shell.exec(`sleep ${tts}`);
        }
    }
}

function publishProductWithoutSpace(catalog, apicServer, apicOrg) {
    for (let obj of catalogs[catalog]) {
        let product = obj.productName,
            isDeploy = obj.deploy || false;
        if (isDeploy === true) {
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product}`).code !== 0) {
                logger(`Error: publishing product ${product}`);
                shell.exec(`cat ${product}`);
                return shell.exit(1);
            }
            logger(`publishing product ${product} finished`);
            shell.exec(`sleep ${tts}`);
            console.log("inside true", scope);
        }
    }
}
module.exports = {
    'publishProducts': publishProducts,
    'publishProductWithSpace': publishProductWithSpace,
    'publishProductWithoutSpace': publishProductWithoutSpace
}