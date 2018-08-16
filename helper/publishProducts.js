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
            // console.log("completeFilteredProducts",completeFilteredProducts);
            // console.log("filteredProducts",filteredProducts);
            completeFilteredProducts = [...productCatalog, ...completeFilteredProducts];
            console.log("completeFilteredProducts", productCatalog);
            // shell.exec(`apic config:set catalog=apic-catalog://management01.psd2.sandbox.extranet.group/orgs/prototype/catalogs/sb`);
            // shell.exec(`apic login -s ${apicServer} -u mohit.jain -p Lion@1234`);
            // shell.exec(`apic products:set ${configObj.name}:1.0.0 --server ${apicServer} -c channel -o ${apicOrg} --status deprecated`);
            // shell.exec(`apic products:get ${configObj.name} --server ${apicServer} -c channel -o ${apicOrg}`);
            // shell.exec(`apic products:replace ${configObj.name}:1.0.0 ${configObj.name}:1.0.2 --server ${apicServer} -c channel -o ${apicOrg}`);
        }
    });
    return completeFilteredProducts;
}

function filterItems(query, products) {
    let productCatalog = [];
    products.filter(function(el) {
        if (el.toLowerCase().indexOf(query.toLowerCase()) > -1) {

            let product = el.split(':')[0],
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
                let updatedVersion = fetchVersionProduct(query),
                versionBumpup = compareVersion(updatedVersion.updatedVersion, currentProductVersion);
                if(versionBumpup > 0) {
                    productCatalog = [...productCatalog,`definitions/${updatedVersion.productName}`];
                }
            }
        }
    });
    return productCatalog;
}

function fetchVersionProduct(query) {
    let productDefinitions = definitions.products.filter(publishProduct => publishProduct.configObj.name === query),
        productName = productDefinitions[0].filename,

        fetchProduct = yaml.safeLoad(fs.readFileSync(`${definitionPath}/${productName}`, 'utf8')),
        updatedVersion = fetchProduct.info.version;
    return {
        updatedVersion: updatedVersion,
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
        if (parseInt(updatedVersion_components[i]) > parseInt(publishedVersion_components[i])) {
            return 1;
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
    console.log("publishedProducts",publishedProducts);

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
            // shell.exec(`apic products:replace ob-lbg-discovery-endpoint-lyds:1.0.1 ob-lbg-discovery-endpoint-lyds:1.0.2 --server ${apicServer} -c channel -o ${apicOrg} --plans default:default`);
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