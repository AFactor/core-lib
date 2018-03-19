const Mocha = require('mocha');
const testDataManager = require('./test-data-manager');


class TestRunner {
    constructor() {
        this.runner = null;
        this.tags = '';
        this.runner = new Mocha({
            useColors: 'c'
        });
        this.runner.addFile('./src/api.spec.js');
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
