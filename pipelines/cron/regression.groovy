/*
 * Author: Abhay Chrungoo <achrungoo@sapient.com>
 * Contributing HOWTO: TODO
 */

 /*
  * Invocation up top. Should function as a standalone Jenkinsfile
  */

 invokeCronRegression (args)
 
 /*
  * Avoid nested workspace allocations.
  * eg: dont invoke node(){ } in a utility method
  * Can call other pipelines handlers/scripts if needed
  */
 
 def invokeCronRegression(args){
	 node(){
		 /*
		  * Implementation
		  */
		 
	 }
 }
 
 def utilityMethod(args){
	 /*
	  * Implementation
	  */
 }