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

const { pullLatestPublishedVersion } = require('../helper/migrateProducts.js');

const configFolderPath = path.resolve("./", 'urbanCode');
const catalogs = require(`${configFolderPath}/catalogs.json`);

function publishProducts() {
    for (let catalog in catalogs) {
        let catalogName = process.env[catalog].toLowerCase();
        if(!catalogName){
            throw new Error('Catalog is missing');
        }


        if (!Array.isArray(catalogs[catalog])) {
            for (let space in catalogs[catalog]) {
                let spaceName = process.env[space].toLowerCase();
                if(!spaceName){
                    throw new Error('Space is missing');
                }

                let publishedProductsList = getProductsFromSpace(catalogName, spaceName);

                if (shell.exec(`apic config:set space=apic-space://${apicServer}/orgs/${apicOrg}/catalogs/${catalogName}/spaces/${spaceName}`).code === 0) {
                    const products = catalogs[catalog][space];
                    publishProductWithSpace(products, apicServer, apicOrg, publishedProductsList, catalogName);
                } else {
                    logger(`Error: setting space to ${spaceName} in catalog ${catalogName} and organisation - ${apicOrg}`);
                    return shell.exit(1);
                }
            }
        } else {
            let publishedProductsList = getProductsFromCatalog(catalogName);

            if (shell.exec(`apic config:set catalog=apic-catalog://${apicServer}/orgs/${apicOrg}/catalogs/${catalogName}`).code === 0) {
                publishProductWithoutSpace(catalogName, apicServer, apicOrg, publishedProductsList);
            } else {
                logger(`Error: setting catalog to ${catalogName} in organisation - ${apicOrg}`);
                return shell.exit(1);
            }
        }
    }
};

function getProductsFromSpace(catalog, space) {
    let productsList = shell.exec(`apic products --server ${apicServer} -c ${catalog} --scope space --space ${space} -o ${apicOrg}`),
        publishedProductsList = JSON.stringify(productsList);

    publishedProductsList = publishedProductsList.split(/\\n/g, );
    return publishedProductsList;
}

function getProductsFromCatalog(catalog) {
    let productsList = shell.exec(`apic products --server ${apicServer} -c ${catalog} -o ${apicOrg}`),
        publishedProductsList = JSON.stringify(productsList);

    publishedProductsList = publishedProductsList.split(/\\n/g, );
    return publishedProductsList;
}

function publishProductWithSpace(products, apicServer, apicOrg, publishedProductsList, catalog) {
    for (let obj of products) {
        let product = obj.productName,
            isDeploy = obj.deploy || false;
        if (isDeploy === true) {
            const publishProduct = product.split('/')[1],
                replaceProduct = publishProduct.split('.')[0];

            const pullProducts = pullLatestPublishedVersion(publishProduct, publishedProductsList, catalog);
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product} --scope space`).code !== 0) {
                logger(`Error: publishing product ${product}`);
                shell.exec(`cat ${product}`);
                return shell.exit(1);
            }

            logger(`publishing product ${product} finished`);

            if (pullProducts.oldVersion.length) {
                shell.exec(`apic products:replace ${replaceProduct}:${pullProducts.oldVersion} ${replaceProduct}:${pullProducts.newVersion} --server ${apicServer} -c ${catalog} -o ${apicOrg} --plans default:default`);
            }
            shell.exec(`sleep ${tts}`);
        }
    }
}

function publishProductWithoutSpace(catalog, apicServer, apicOrg , publishedProductsList) {
    for (let obj of catalogs[catalog]) {
        let product = obj.productName,
            isDeploy = obj.deploy || false;
        if (isDeploy === true) {
            const publishProduct = product.split('/')[1],
                replaceProduct = publishProduct.split('.')[0];

            const pullProducts = pullLatestPublishedVersion(publishProduct, publishedProductsList, catalog);
            logger(`publishing product ${product} started`);
            if (shell.exec(`apic publish -s ${apicServer} ${product}`).code !== 0) {
                logger(`Error: publishing product ${product}`);
                shell.exec(`cat ${product}`);
                return shell.exit(1);
            }

            logger(`publishing product ${product} finished`);
            
            if (pullProducts.oldVersion.length) {
                shell.exec(`apic products:replace ${replaceProduct}:${pullProducts.oldVersion} ${replaceProduct}:${pullProducts.newVersion} --server ${apicServer} -c ${catalog} -o ${apicOrg} --plans default:default`);
            }
            shell.exec(`sleep ${tts}`);
        }
    }
}
module.exports = {
    'publishProducts': publishProducts
}