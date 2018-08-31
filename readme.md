# Getting Started
It will create all the yamls inside the definition folder .
It will replace all the tokens in the definition folder by the urls present in job.configuration.json file !!
It will replace the catalog name and space name inside the catlogs.json from the job-configuration.json file !!
It will also publish the products.
Before publishing the product , it will check the versions of the product which are already published , if the version which we want to publish is higher than the published version by 1 , it will hot replace the existing product with the new version product.

1. Install the following npm module
    ``` npm install core-gateway-lib --save ```
2. Require all the below functions in your setup.js file.
   ``` const { replaceTokens, publishProducts, setupApis, setupProducts } = require('core-gateway-lib'); ```

3. Run the command 'npm run setup' which will create all the yamls of apis and products inside the definition folder.

4. Run the command 'npm run replace-tokens' . It will replace all the tokens inside the definition folder with the tokens present in job-configuration.file. It will also replace the tokenized value of catalog and space in catlogs.json from the job-configuration.file.

5. Product version has also been tokenized. So update the job-configuration.json with those parameters accordingly.

6. Run the command 'npm run publish-products'. It will publish only those products which are to be published as we have given the feature of publish individual products rather than the whole products in the artifact. This can be done by applying flag deploy:true to those products which are to be published.

7. Before publishing the product , it will check the versions of the product which are already published , if the version which we want to publish is higher than the published version by 1 , it will hot replace the existing product with the new version product.


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

2. update your package.json with some arguments . Take the reference from health-check repo.

3. Remove publish-products and replace-tokens gulp dependency from the gulpfile,js. Also remove all the extra dependency which they were using . Take the reference from health-check repo.

4. Inside job-configuration.json , add new product version tokens . Eg : "DISCOVERY_PRODUCT_LYDS_VERSION" . Take the reference from health-check repo.

5. Pass these variables of product version to definition.json. Eg:  version:"&&DISCOVERY_PRODUCT_LYDS_VERSION&&"

6. In product.hbs , change {{version}} from this to {{{version}}} . Double curly braces to triple curly braces.

7. In your catalogs.json , the catalog names and spaces should have the same ket as we are giving in job-configurations.json.

8. Inside application.groovy , make the changes as done in PR. Take the reference from health-check repo.

### How should developer add new feature and use this library?

1. Inside src/index.js , we are exporting only those functions which are required as of now like setup products , setupApis , replace tokens and publishing the product. 

2. To add new functionality, create a file inside helper folder like other files created and export that so that it can be exported to the repos in which is it is to be used.

3. Make sure we use minimum modules so that , its not become too heavy. The modules which we are using , add them to package.json dependency and the modules which are required locally , add them to devDependecy.

4. If all together new functionality is created inside the module , increase the minor version like (1.2.0) from (1.1.8) and if some small code fixes and functionality are been added to existing files increase the patch version like (1.1.9) from (1.1.8). After making these changes , publish the version and make sure what are the new functionalities we are publishing in that version.

5. If we have a create a new run command for the new feature or functionality we are making , we have to update inside the repo in which it is called. Like this
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

	If the task is increasing , better to use switch case instead of if else.

6. Every update of this library should contain the updated readme with the new feature we are implementing in that particular version.

7. Whatever new functionality which we embed should be synced, showcased and tested on health-check api.






