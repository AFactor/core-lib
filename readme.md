# Getting Started
It will create all the yamls inside the definition folder .
It will replace all the tokens in the definition folder by the urls present in job.configuration.json file !!
It will replace the catalog name and space name inside the catlogs.json from the job-configuration.json file !!
It will also publish the products.

1. Install the following npm module
    ``` npm install core-gateway-lib --save ```
2. Require all the below functions in your setup.js file.
   ``` const { replaceTokens, publishProducts, setupApis, setupProducts } = require('core-gateway-lib'); ```

3. Run the command 'npm run setup' which will create all the yamls of apis and products inside the definition folder.

4. Run the command 'npm run replace-tokens' . It will replace all the tokens inside the definition folder with the tokens present in job-configuration.file. It will also replace the tokenized value of catalog and space in catlogs.json from the job-configuration.file.

5. Product version has also been tokenized. So update the job-configuration.json with those parameters accordingly.

6. Run the command 'npm run publish-products'. It will publish only those products which are to be published as we have given the feature of publish individual products rather than the whole products in the artifact. This can be done by applying flag deploy:true to those products which are to be published.


### Changes to be made

1. Inside your setup.js replace all the code with only the below piece of code.
	const { replaceTokens, publishProducts, setupApis, setupProducts } = require('core-gateway-lib');
	const run = process.argv[2];

	if (run === 'generate-definitions') {
	  setupApis();
	  setupProducts();
	  
	} else if (run === 'replace-tokens') {
	  replaceTokens();

	} else if (run === 'publish-products') {
	  publishProducts();

	} else {
	  throw new Error('Argument undefined');
	}

2. update your package.json with some arguments . Take the reference from discovery-api repo.

3. Remove publish-products and replace-tokens gulp dependency from the gulpfile,js. Also remove all the extra dependency which they were using . Take the reference from discovery-api repo.

4. Inside job-configuration.json , add new product version tokens . Eg : "DISCOVERY_PRODUCT_LYDS_VERSION" . Take the reference from discovery-api repo.

5. Pass these variables of product version to definition.json. Eg:  version:"&&DISCOVERY_PRODUCT_LYDS_VERSION&&"

6. In product.hbs , change {{version}} from this to {{{version}}} . Double curly braces to triple curly braces.

7. In your catalogs.json , the catalog names and spaces should have the same ket as we are giving in job-configurations.json.

8. Inside application.groovy , make the changes as losyed in PR. Take the reference from discovery-api repo.

