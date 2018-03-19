#!/bin/bash
#
source ~/.bashrc

echo targetEnv is :-  ${targetEnvironment}
echo application is :- ${appname}
echo branch is :- ${targetBranch}
set -ex

function deployBluemix {
if [ "${BRANCH}" == "master" -o "${BRANCH}" == "release*" ]
then
echo Publishing module for integration branch ${BRANCH}
npm3 publish --registry http://nexus.sandbox.extranet.group/nexus/content/repositories/npm-internal/
else
echo Publishing module is only allowed in integration branches, please merge your ${BRANCH} branch in correct integration branch to publish this module.
fi
}


cd $deployable
#find ./server/ -type f -print0 | xargs -0 sed -i "s#\#HOST_URL\##${HOST_URL}#g"

deployBluemix
