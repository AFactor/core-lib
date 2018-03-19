def runTest(String targetBranch, context){
	node() { echo "Dummy Integration test to trigger a re-deployment" }
}
def publishSplunk(String targetBranch, String epoch, context, handler){
}
String name(){
	return "Ping"
}
return this;
