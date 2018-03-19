/*
 * Author: Abhay Chrungoo <abhay@ziraffe.io>
 * Contributing HOWTO: TODO
 */
def runTest(String targetBranch, context){
	node() { 
		checkout scm 
		stash  name: "pipelines-${context.application}-${targetBranch}", includes: 'pipelines/**'
		this.runTestHandler(targetBranch, context)
	}
}

def publishSplunk(String targetBranch, String epoch, context, handler){
	echo "SKIPPING: Nothing to publish to Splunk"
}

String name(){
	return "Unit"
}

def runTestHandler(String targetBranch, context){
	try {
		sh 'pipelines/scripts/setup-environment.sh'
		sh 'pipelines/scripts/unit-test.sh '
		dir('coverage'){
			stash name: "coverage-${context.application}-${targetBranch}", includes: 'lcov.info'
		}
		publishHTML([	allowMissing: false,
			alwaysLinkToLastBuild: false,
			keepAll: false,
			reportDir: 'coverage/lcov-report',
			reportFiles: 'index.html',
			reportName: 'Coverage'])
	} catch (error) {
		echo "FAILED: Unit Tests "
		throw error
	} finally {
		//Publish anything thats needed
		//Cleanup
		junit testResults: '**/junit/*.xml', allowEmptyResults: true
		step([$class: 'WsCleanup', notFailBuild: true])
	}
}

return this;
