#! /bin/bash

if [ -z "${invokeBDD}" ]
    then
      echo "FAILED: invokeBDD Unset. Dont know how to test."
      exit 1;
fi

if [ -z "${APP}" ]
    then
      echo "FAILED: APP Unset. Dont know which API to test"
      exit 1;
fi

source ${WORKSPACE}/pipelines/scripts/functions
set -ex

find tests/acceptance/wdio/ -type f | xargs sed -i 's#${API_ENDPOINT}#'${APP}'#g'

unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

${invokeBDD}

# Remove spaces from outputfiles
cd ${RESULTSDIR}
find . -type f -name "* *.json" -exec bash -c 'mv "$0" "${0// /_}"' {} \;

# Remove absolute paths from BDD json. Dont let this fail the build
sed -i 's+'${WORKSPACE}'/++g'  *.* || true
