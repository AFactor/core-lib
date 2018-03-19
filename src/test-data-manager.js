class TestDataManager {
    constructor(){
        this.data = {};
    }

    addTestData(tag, items){
        this.data[tag]=items;
    }
}

module.exports = new TestDataManager();
