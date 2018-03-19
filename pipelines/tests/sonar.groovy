/*
 * Author: Abhay Chrungoo <abhay@ziraffe.io>
 * Contributing HOWTO: TODO
 */
def runTest(String targetBranch, context){
	node() {
		checkout scm
		dir('coverage'){
			deleteDir()
			unstash "coverage-${context.application}-${targetBranch}"
		}
		this.runTestHandler(targetBranch, context)
	}
}

def publishSplunk(String targetBranch, String epoch, context, handler){
	echo "Nothing to do here"
}

String name(){
	return "Sonar"
}

def runTestHandler(String targetBranch, context){
	def appname = appName(context.application, targetBranch)
	def sonarJavaOptions = [
		'-Dsonar.projectKey': appname ,
		'-Dsonar.projectName': appname ,
		'-Dappname': appname ,
		'-DbranchName': targetBranch ,
		'-Dsonar.projectVersion': env.BUILD_NUMBER ,
		'-Dsonar.sources': '.' ,
		'-Dsonar.exclusions': "\'${context.config.sonar.exclusions}\'" ,
		'-Dsonar.coverage.exclusions': "\'${context.config.sonar.coverage_exclusions}\'" ,
		'-Dsonar.javascript.lcov.reportPath': 'coverage/lcov.info' ,
		'-Dsonar.qualitygate': context.config.sonar.quality_gate ,
		'-Dsonar.scm.enabled': 'true'
	]

	try {

		sonarRunner {
			sonarServer = context.config.sonar.server_id
			preRun = '~/.bashrc'
			javaOptions = sonarJavaOptions
		}
	} catch (error) {
		echo "Sonar Qualification failed. Continuing"
		//echo error.message
		throw error
	}
	finally {
		//Publish anything thats needed
		//Cleanup
		step([$class: 'WsCleanup', notFailBuild: true])
	}
}
return this;
