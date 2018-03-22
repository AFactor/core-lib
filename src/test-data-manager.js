const tagsArr = require('./enum/tags');
class TestDataManager {
    constructor(){
        this.data = {};
        for(let i in tagsArr) {
            this.data[tagsArr[i]] = [];
        }
    }

    addTestData(tag, items){
        this.data[tag].push(items);
    }
}

module.exports = new TestDataManager();
