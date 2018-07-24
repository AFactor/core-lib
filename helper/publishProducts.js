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
                    publishProductCatalog(products, '--scope space');

                } else {
                    logger(`Error: setting space to ${space} in catalog ${catalog} and organisation - ${apicOrg}`);
                    return shell.exit(1);
                }
            }
        } else {
            if (shell.exec(`apic config:set catalog=apic-catalog://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}`).code === 0) {
                const products = catalogs[catalog];
                publishProductCatalog(products);
                
            } else {
                logger(`Error: setting catalog to ${catalog} in organisation - ${apicOrg}`);
                return shell.exit(1);
            }
        }
    }
};

function publishProductCatalog(products, scope) {
    scope = scope || '';
    for (let obj of products) {
        let product = obj.productName,
            isDeploy = obj.deploy || false;
        if (isDeploy === true) {
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product} ${scope}`).code !== 0) {
                logger(`Error: publishing product ${product}`);
                shell.exec(`cat ${product}`);
                // shell.exec('definitions/account-information-internal-bos.yaml');
                return shell.exit(1);
            }
            logger(`publishing product ${product} finished`);
            shell.exec(`sleep ${tts}`);
        } 
    }
}
module.exports = {
    'publishProducts': publishProducts,
    'publishProductCatalog': publishProductCatalog
}