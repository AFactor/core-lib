def runTest(String targetBranch, context) {
	def gitBddRepo = context.config.bdd.git_repo
	def gitBddBranch = this.findCorrespondingBDDBranch()

	node() {
		try{
			git branch: gitBddBranch, url: gitBddRepo
		}catch(error){
			echo "FAILED: Cannot find a matching  bdd branch to test against"
			throw error
		}
		unstash "pipelines-${context.application}-${targetBranch}"
		this.runTestHandler(targetBranch, context)
	}
}
def runTestHandler(String targetBranch, context) {
	def app = appName(context,targetBranch)
	def invokeBDD = context.config.bdd.invocation ?: 'fail'
	def scenarioPassThreshold = context.config.passthresholds.bdd.percent_scenarios ?: '100'
	try {
		withEnv([
			"APP=${app}",
			"invokeBDD=${invokeBDD}",
			"RESULTSDIR=tests/acceptance/wdio/utilities/output"
		]) {
			sh 'rm -rf ${RESULTSDIR} && mkdir -p ${RESULTSDIR}'
			sh 'pipelines/scripts/setup-environment.sh'
			sh 'pipelines/scripts/bdd.sh'

			archiveArtifacts 'tests/acceptance/wdio/utilities/output/**'

			dir("${RESULTSDIR}") {
				stash     name: "BDD-${context.application}-${targetBranch}"
				includes: '*.json'
				withEnv([
					"SCENARIO_PASS_THRESHOLD=${scenarioPassThreshold}"
				]){    sh "${env.WORKSPACE}/pipelines/scripts/bdd-pass-threshold-checker.sh"    }
			}
		}
	} catch (error) {
		echo "FAILED: BDD"
		throw error
	} finally {
		step([	$class: 'CucumberReportPublisher',
			failedFeaturesNumber: 99999999999,
			failedScenariosNumber: 9999999999,
			failedStepsNumber: 99999999999,
			fileExcludePattern: '',
			fileIncludePattern: '**/apitests**.json',
			jsonReportDirectory: 'tests/acceptance/wdio/utilities/output',
			parallelTesting: false,
			pendingStepsNumber: 99999999999,
			skippedStepsNumber: 99999999999,
			trendsLimit: 0,
			undefinedStepsNumber: 99999999999
		])
	}
}

def publishSplunk(String targetBranch, String epoch, context, handler){
	def appname = appName(context, targetBranch)
	def journey = context.config.journey?: 'INVALID'
	def splunkReportDir = "${context.config.splunk.reportdir}"
	echo "PUBLISH: ${this.name()} ${appname} reports to Splunk"
	sh 'rm -rf j2/bddReports'
	dir ('j2/bddReports') {
		unstash "BDD-${context.application}-${targetBranch}"
		withEnv([
			"appname=${appname}",
			"epoch=${epoch}"
		]) {   sh """ mkdir -p ${journey}/bdd/${appname}/${epoch}  && \\
                      cp *.json ${journey}/bdd/${appname}/${epoch}
                  """ }
		handler.SCP(    '*.json',
				"${splunkReportDir}")
		handler.RSYNC (journey,
				'/apps/reports/')
	}
}

String findCorrespondingBDDBranch(){
	def bddBranch
	if(env.BRANCH_NAME.startsWith('patchset')){
		bddBranch =  gerritHandler.findTargetBranch(this.findTargetCommit())
	} else{
		bddBranch = "${env.BRANCH_NAME}"
	}
	return bddBranch
}

String findTargetCommit(){
	def targetCommit
	node (){
		checkout scm
		targetCommit =  sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
	}
	return targetCommit
}

String name() {
	return "BDD"
}

return this;
