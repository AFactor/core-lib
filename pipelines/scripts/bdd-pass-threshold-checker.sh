#!/bin/bash


source "${WORKSPACE}/pipelines/scripts/functions"

set -ex

which awk
which jq

 if [ -z "${SCENARIO_PASS_THRESHOLD}" ]
    then 
      echo "PASS_THRESHOLD unset"
      exit 1;
  fi 

failCounter=0
passedCounter=0
for file in $(ls *.json)
do
   totalTC=$(cat "$file" | jq ".[] | .id" | wc -l)
   if [ "$totalTC"  -eq "0" ] ; then
   		echo "No Test Results found. Failed!" 
		exit 1
   fi
  
   for eachTC in $(seq 0 $((totalTC-1)))
   do
       elementsLength=$(cat "$file" | jq ".[${eachTC}].elements|length")
       for eachElement in $(seq 0 $((elementsLength-1)))
       do
           if [ "$(cat "$file" | jq ".[${eachTC}] | .elements[${eachElement}].steps[]" | grep "\"status\"" | sed 's/skipped/failed/g' | grep -o failed | sort -u)" == "failed" ];then
               failCounter=$((failCounter+1))
           else 
               passedCounter=$((passedCounter+1))
           fi
       done
   done
done
totalCounter=$((${failCounter}+${passedCounter}))
passedPer=$(echo $passedCounter $totalCounter | awk '{printf "%.f \n", $1/$2*100}')

if [ "${passedPer}" -lt "${SCENARIO_PASS_THRESHOLD}" ];then
	echo "Scenario pass percentage ${passedPer} below ${SCENARIO_PASS_THRESHOLD}. Failed!" 
	exit 1
else
	echo "Scenario pass percentage ${passedPer} meets threshold ${SCENARIO_PASS_THRESHOLD}. Success!"	
fi
