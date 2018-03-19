def pack(String targetBranch, String targetEnv, context){
	node(){
		checkout scm
		this.packHandler(targetBranch,  targetEnv, context)
	}
}
def packHandler(String targetBranch, String targetEnv, context){
	def artifact = this.artifactName(targetBranch, targetEnv, context)
	def packagingOptions = context.config.packaging.npm_options?: ''
	try {

		sh "pipelines/scripts/setup-environment.sh  ${packagingOptions}"
		sh """rm -rf j2 && mkdir -p j2  && \\
				tar --warning=file-changed \\
				--exclude='./*.tar.gz' \\
				--exclude='.git/*' \\
				--exclude='pipelines' \\
				--exclude='Jenkinsfile' \\
				--exclude='./coverage/*' \\
				--exclude='./j2/*' \\
				-zcf j2/${artifact} \\
				.
		"""
		dir('j2'){
			stash name: "artifact-${context.application}-${targetBranch}", includes: artifact
			archive artifact
		}
	} catch (error) {
		echo "FAILED: BUilding tarball"
		throw error
	} finally {
		step([$class: 'WsCleanup', notFailBuild: true])
	}
}

def publishNexus(String targetBranch, String targetEnv, context){
	node() {
		this.publishNexusHandler(targetBranch, targetEnv, context)
	}
}

def publishNexusHandler(String targetBranch, String targetEnv, context){
	if (isIntegrationBranch(targetBranch)) {
		node() {
		checkout scm
		try {
			def nexusURL = context.config.nexus.url ?: 'http://invalid.url/'
			echo "Publish artifact to ${nexusURL}"
			sh "git rev-parse HEAD > .git-sha"
			withVaultAppRole ('jenkins-ob-vault-approle', ['npm_auth': 'apps/nexus/npm/npmpublish']) {
				sh """	source pipelines/scripts/functions && \\
						echo "registry=${nexusURL}" > ${env.WORKSPACE}/.npmrc && \\
						echo "email=npmpublish" >> ${env.WORKSPACE}/.npmrc && \\
						echo "_auth=${npm_auth}" >> ${env.WORKSPACE}/.npmrc && \\
						version-checker.js && \\
						npm3 publish --registry ${nexusURL}"""
			}
		} catch (error) {
			echo "Failed to publish to npm registry: ${error.message}"
			throw error
		} finally {
			step([$class: 'WsCleanup', notFailBuild: true])
		}
		}
	} else {
		echo "Publishing module is only allowed in integration branches, please merge your changes into masters/release branch to publish this module"
	}
}

def name(){
	return "gulp"
}

//Optional Methods. Not part of Signature
String revision(){
	return sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
}

String artifactName(String targetBranch, String targetEnv, context) {
	return ("${targetBranch}-${context.application}-artifact-"
			+ env.BUILD_NUMBER
			+ '-'
			+ this.revision()
			+ ".tar.gz")
}

return this;
