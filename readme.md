# Getting Started
It will replace all the tokens in the definition folder by the urls present in job.configuration.json file !!
1. Install the following npm module
    ``` npm install core-gateway-lib --save ```
2. Require the project in your replace.tokens.js file
   ``` const { replaceTokens, publishProducts, setupApis, setupProducts } = require('apie-definition-setup');
;
 ```
3. Add the definitions folder by calling 'setupApis()' AND 'setupProducts()' function. and running 'npm run setup' command.

4. change the catalog.json channel and space name to the variables .

5. Add the token values from job-configuration.json to the yamls created in definition folder by runnning 'npm run replace-tokens' . This command will also update the catalog and space name in catalogs.json.

6. Run 'npm run publish-products' to instead of gulp publish command.

### Test Scenerios
