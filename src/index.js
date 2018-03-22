const path = require('path');
const Mocha = require('mocha');
const testDataManager = require('./test-data-manager');

class TestRunner {
    constructor() {
        this.runner = null;
        this.tags = '';
        this.runner = new Mocha({
            useColors: 'c',
            timeout :20000
        });
        const specPath =  path.resolve(__dirname, 'api.spec.js');
        this.runner.addFile(specPath);
    }

    run() {
        this.runner.grep(this.tags);
        this.runner.run(function (failures) {
            process.on('exit', function () {
                process.exit(failures); // exit with non-zero status if there were failures
            });
        });
    }

    addTest(tag, options) {
        this.tags = this.tags ? `${this.tags}|${tag}` : `${tag}`;
        testDataManager.addTestData(tag, options);
    }
}

module.exports = new TestRunner();
