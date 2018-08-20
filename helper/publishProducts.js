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
const yaml = require('js-yaml');

const { createDeployableProducts } = require('../helper/commonSetup.js');


const configFolderPath = path.resolve("./", 'urbanCode');
const definitionPath = path.resolve('./', 'definitions');
const productSettings = require(`${configFolderPath}/products.json`);
const definitions = require(`${configFolderPath}/definitions.json`);
const catalogs = require(`${configFolderPath}/catalogs.json`);

function pullVersionProducts() {
    let productsList = shell.exec(`apic products --server ${apicServer} -c channel -o ${apicOrg}`),
        publishedProductsList = JSON.stringify(productsList);

    publishedProductsList = publishedProductsList.split(/\\n/g, );
    let products = createDeployableProducts(),
        pullProducts = pullPublishedProducts(products, publishedProductsList);
    if (!pullProducts.length) {
        throw new Error('check version to be published');
    }
    return pullProducts;
}

function pullPublishedProducts(products, publishedProductsList) {
    let completeFilteredProducts = [];
    products.forEach(function(product) {
        const productDefinitions = definitions.products.filter(publishProduct => publishProduct.filename === product);
        for (let definition in productDefinitions) {
            const product = productDefinitions[definition];
            let configObj = product.configObj;
            const templateConf = product.templateConf;
            if (templateConf) {
                configObj = Object.assign({}, configObj, productSettings.productTemplates[templateConf].config);
            }
            let productCatalog = filterItems(configObj.name, publishedProductsList);
            completeFilteredProducts = [...productCatalog, ...completeFilteredProducts];
        }
    });
    return completeFilteredProducts;
}

function filterItems(query, products) {
    let productCatalog = [],
        previousProducts = [],
        allPreviousPublishedVersion = [],
        updatedVersion,
        toBePublishedVersion,
        product,
        currentProductVersion,
        publishedVersion,
        versionBumpup;

    products.filter(function(el) {
        if (el.toLowerCase().indexOf(query.toLowerCase()) > -1) {

            product = el.split(':')[0];
            currentProductVersion = el.split(':')[1];

            currentProductVersion = currentProductVersion.split(' ')[0];

            let getProductProperties = shell.exec(`apic products:get ${query}:${currentProductVersion} --server ${apicServer} -c channel -o ${apicOrg}`),
                publishedProductProperties = {};

            getProductProperties = JSON.stringify(getProductProperties);
            getProductProperties = getProductProperties.split(/\\n/g, );

            for (let index in getProductProperties) {
                let split = getProductProperties[index].split(': ');
                publishedProductProperties[split[0]] = split[1];
            }

            if (publishedProductProperties.status === "published") {
                publishedVersion = publishedProductProperties.version;
                updatedVersion = fetchVersionProduct(query);
                toBePublishedVersion = updatedVersion.newVersion;
                versionBumpup = compareVersion(toBePublishedVersion, publishedVersion);
                if (versionBumpup > 0) {
                    previousProducts = [...previousProducts, `${el}`]
                    productCatalog = [...productCatalog, `definitions/${updatedVersion.productName}`];

                }
            }
        }
    });
    checkPublishedProducts(previousProducts,productCatalog,product, publishedVersion, toBePublishedVersion);
    return productCatalog;
}

function checkPublishedProducts(previousProducts,productCatalog,product, publishedVersion, toBePublishedVersion) {
    if (productCatalog.length > 1) {
        throw new Error(`multiple versions of same products has been published "${previousProducts}" and the current version which is to be published is ${toBePublishedVersion}, rectify this and make sure only one version of the product is published , then try again publishing the product`);
    } else {
        let differenceVersion = compareVersion(toBePublishedVersion, publishedVersion);
        if (productCatalog.length && differenceVersion === 1) {
            // publishProductsNew(toBePublishedVersion,publishedVersion,product);
        } else {
            throw new Error('New version should be higher by one than the already published version');
        }

    }
}

function fetchVersionProduct(query) {
    let productDefinitions = definitions.products.filter(publishProduct => publishProduct.configObj.name === query),
        productName = productDefinitions[0].filename,

        fetchProduct = yaml.safeLoad(fs.readFileSync(`${definitionPath}/${productName}`, 'utf8')),
        updatedVersion = fetchProduct.info.version;
    return {
        newVersion: updatedVersion,
        productName: productName
    }

}


// Return 1 if updatedVersion > publishedVersion
// Return -1 if updatedVersion < publishedVersion
// Return 0 if updatedVersion == publishedVersion
function compareVersion(updatedVersion, publishedVersion) {
    if (updatedVersion === publishedVersion) {
        return 0;
    }

    let updatedVersion_components = updatedVersion.split("."),
        publishedVersion_components = publishedVersion.split(".");

    let len = Math.min(updatedVersion_components.length, publishedVersion_components.length);

    // loop while the components are equal
    for (let i = 0; i < len; i++) {
        // A bigger than B
        if ((parseInt(updatedVersion_components[i]) > parseInt(publishedVersion_components[i]))) {
            let differenceVersion = (parseInt(updatedVersion_components[i]) - parseInt(publishedVersion_components[i]));
            console.log("difference", differenceVersion);
            return differenceVersion;
        }

        // B bigger than A
        if (parseInt(updatedVersion_components[i]) < parseInt(publishedVersion_components[i])) {
            return -1;
        }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (updatedVersion_components.length > publishedVersion_components.length) {
        return 1;
    }

    if (updatedVersion_components.length < publishedVersion_components.length) {
        return -1;
    }

    // Otherwise they are the same.
    return 0;
}


function publishProducts() {
    let publishedProducts = pullVersionProducts();
    console.log("publishedProducts", publishedProducts);
};

function publishProductsNew(toBePublishedVersion, currentProductVersion, product) {
    for (let catalog in catalogs) {
        // let catalogName = process.env[catalog];
        // if(!catalogName){
        //     throw new Error('Catalog is missing');
        // }
        if (!Array.isArray(catalogs[catalog])) {
            for (let space in catalogs[catalog]) {
                // let spaceName = process.env[space];
                // if(!spaceName){
                //     throw new Error('Space is missing');
                // }
                // console.log("value",shell.exec(`apic config:get space=apic-space://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}/spaces/${space}`).code);
                if (shell.exec(`apic config:set space=apic-space://${apicServer}/orgs/${apicOrg}/catalogs/${catalog}/spaces/${space}`).code === 0) {
                    const products = catalogs[catalog][space];
                    publishProductWithSpace(products, apicServer, apicOrg, toBePublishedVersion, currentProductVersion, product);
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
}

function publishProductWithSpace(products, apicServer, apicOrg, toBePublishedVersion, currentProductVersion, product) {
    let newProduct = product;
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
            shell.exec(`apic products:replace ${newProduct}:${currentProductVersion} ${newProduct}:${toBePublishedVersion} --server ${apicServer} -c channel -o ${apicOrg} --plans default:default`);
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
    'publishProducts': publishProducts
}