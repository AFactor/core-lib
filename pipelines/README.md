## Pipelines as Code for this source..

###  Usage

#### Sample1
```
@Library('workflowlib-sandbox@v1.0.1')
import com.lbg.workflow.sandbox.*

def configuration = "pipelines/conf/job-configuration.json"
BuildHandlers handlers = new CWABuildHandlers() as BuildHandlers
	
invokeBuildPipelineHawk( 'pca-sales-cwa', handlers, configuration )
```

#### Sample2
```
@Library('workflowlib-sandbox@v1.0.1')
import com.lbg.workflow.sandbox.*

def configuration = "pipelines/conf/job-configuration.json"
BuildHandlers handlers = new ConfigurableBuildHandlers('pipelines/build/package.groovy',
			'pipelines/deploy/application.groovy',
			[	'pipelines/tests/unit.groovy'] ,
			[	'pipelines/tests/sonar.groovy', 
				'pipelines/tests/checkstyle.groovy' ],
			[ 	'pipelines/tests/performance.groovy',
				'pipelines/tests/accessibility.groovy',
				'pipelines/tests/bdd.groovy']
		) as BuildHandlers
	
invokeBuildPipelineHawk( 'your-api-codebase', handlers, configuration )
```

### Contract

##### All tests in pipelines/tests folder
##### Tests must implement
```
	runTest(String targetBranch, context)
	publishSplunk(String targetBranch, String epoch, context, handler)
	String name()
```

##### Mandatory Build handler in pipelines/build folder with  typical name package.groovy
##### Builder must implement
```
	pack(String targetBranch, String targetEnv, context)
	publishNexus(String targetBranch, String targetEnv, context)
	String name()
```

##### Mandatory Deployment handler in pipelines/deploy folder with  typical name application.groovy
##### Deployer must implement
```
deploy(String targetBranch, BuildContext context)
purge(String targetBranch, context)
String name()	
```

##### mandatory job-configuration in pipelines/conf folder typically called job-configuration.json
##### <ust be a valid json, and available to methods as context.config

