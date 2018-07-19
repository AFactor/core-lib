# Getting Started
It will replace all the tokens in the definition folder by the urls present in job.configuration.json file !!
1. Install the following npm module
    ``` npm install apie-definition-setup --save ```
2. Require the project in your replace.tokens.js file
   ``` const { replaceTokens } = require('apie-definition-setup');
 ```
3. Add the tokens to the definitions folder by calling 'replaceTokens()' function. Please see below the options.
### Test Scenerios
