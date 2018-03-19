#!/bin/bash

function setupNpm {
		set -ex
	source pipelines/scripts/functions

	npm3 install "$@"
}

setupNpm  "$@"
