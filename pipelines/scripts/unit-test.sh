#!/bin/bash
source ~/.bashrc

function npmTest() {
	source pipelines/scripts/functions
	set -ex
	version-checker.js
	npm test
}

npmTest

find coverage/ -type f | xargs sed -i 's+'${WORKSPACE}'/++g' || true
