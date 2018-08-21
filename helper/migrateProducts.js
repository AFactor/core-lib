/* eslint-disable strict, max-len */
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const apicOrg = process.env.APIC_ORG || 'apigateway-dev';
const apicServer = process.env.APIC_SERVER || 'management01.psd2.sandbox.extranet.group';
const shell = require('shelljs');
const exec = require('child_process').exec;
const yaml = require('js-yaml');


const configFolderPath = path.resolve("./", 'urbanCode');
const definitionPath = path.resolve('./', 'definitions');
const productSettings = require(`${configFolderPath}/products.json`);
const definitions = require(`${configFolderPath}/definitions.json`);


function pullLatestPublishedVersion(product, publishedProductsList, catalog) {
    let productCatalog;
    const productDefinitions = definitions.products.filter(publishProduct => publishProduct.filename === product);
    for (let definition in productDefinitions) {
        const product = productDefinitions[definition];
        let configObj = product.configObj;
        const templateConf = product.templateConf;
        if (templateConf) {
            configObj = Object.assign({}, configObj, productSettings.productTemplates[templateConf].config);
        }
        productCatalog = filterProductsWithVersion(configObj.name, publishedProductsList, catalog);
    }

    return productCatalog;
}

// filter all the products pulled from the catalog with the product we want to publish and fetch the version of the published product and the new version which is about to be published
function filterProductsWithVersion(product, publishedProductsList, catalog) {
    let productCatalog = [],
        previousProducts = [],
        updatedVersion,
        toBePublishedVersion,
        currentProductVersion,
        publishedVersion,
        versionBumpup,
        checkVerionProducts = {
            "toBePublishedVersion": '',
            "publishedVersion": ''
        };
        

    publishedProductsList.filter(function(publishedProduct) {
        if (publishedProduct.toLowerCase().indexOf(product.toLowerCase()) > -1) {

			currentProductVersion = publishedProduct.split(':')[1];
			currentProductVersion = currentProductVersion.split(' ')[0];

            let getProductProperties = shell.exec(`apic products:get ${product}:${currentProductVersion} --server ${apicServer} -c ${catalog} -o ${apicOrg}`),
                publishedProductProperties = {};

            getProductProperties = JSON.stringify(getProductProperties);
            getProductProperties = getProductProperties.split(/\\n/g, );

            for (let index in getProductProperties) {
                let split = getProductProperties[index].split(': ');
                publishedProductProperties[split[0]] = split[1];
            }

            if (publishedProductProperties.status === "published") {
                publishedVersion = publishedProductProperties.version;
                updatedVersion = fetchProductVersion(product);
                toBePublishedVersion = updatedVersion.newVersion;
                versionBumpup = compareVersion(toBePublishedVersion, publishedVersion);
                if (versionBumpup > 0) {
                    previousProducts = [...previousProducts, `${publishedProduct}`]
                    productCatalog = [...productCatalog, `definitions/${updatedVersion.productName}`];

                }
            }
        }
    });
    if (publishedVersion != undefined) {
        checkVerionProducts = checkPublishedProducts(previousProducts, productCatalog, publishedVersion, toBePublishedVersion);
    }
    return {
        newVersion: checkVerionProducts.toBePublishedVersion,
        oldVersion: checkVerionProducts.publishedVersion
    }
}

// check whether more than one version of product is published or not , if yes break the code and also checks whether the new version which is to be published is incremented by 1 from the latest published version in the catalog , if no throw the error else returns the new and already published version
function checkPublishedProducts(previousProducts, productCatalog, publishedVersion, toBePublishedVersion) {
    let newVersion,
        oldVersion;
    if (productCatalog.length > 1) {
        throw new Error(`multiple versions of same products has been published "${previousProducts}" and the current version which is to be published is ${toBePublishedVersion}, rectify this and make sure only one version of the product is published , then try again publishing the product`);
    } else {
        let differenceVersion = compareVersion(toBePublishedVersion, publishedVersion);
        if (productCatalog.length && differenceVersion === 1) {
            newVersion = toBePublishedVersion;
            oldVersion = publishedVersion;
        } else {
            throw new Error('New version should be higher by one than the already published version');
        }

    }
    return {
        toBePublishedVersion: newVersion,
        publishedVersion: oldVersion
    }
}

//Fetching the new versoon of the product which is to published from the yaml generated in the definition folder
function fetchProductVersion(product) {
    let productDefinitions = definitions.products.filter(publishProduct => publishProduct.configObj.name === product),
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


module.exports = {
    'pullLatestPublishedVersion': pullLatestPublishedVersion
}