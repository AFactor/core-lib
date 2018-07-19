@Library('workflowlib-sandbox@v4.2.9')
import com.lbg.workflow.sandbox.*

properties([
	buildDiscarder(logRotator(artifactDaysToKeepStr: '30', artifactNumToKeepStr: '10', daysToKeepStr: '30', numToKeepStr: '10')),
	[$class: 'RebuildSettings', autoRebuild: true, rebuildDisabled: false]
])

def builder = 'pipelines/build/package.groovy'
def deployer = 'pipelines/deploy/application.groovy'
def unitTests = 	  []
def staticAnalyses =  []
def integrationTests = [ 'pipelines/tests/ping.groovy']


String notify = 'LloydsOpenBankingAISP@sapient.com,lloydscjtdevops@sapient.com'
Integer timeout = 30
def configuration = "pipelines/conf/job-configuration.json"
BuildHandlers handlers = new ConfigurableBuildHandlers(	builder,
							deployer,
							unitTests,
							staticAnalyses,
							integrationTests) as BuildHandlers

invokeBuildPipelineHawk( 'apie-core-gateway-lib', handlers, configuration, notify , timeout )
