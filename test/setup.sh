#!/bin/bash
set -eux

SCRIPT_DIRECTORY=$(cd $(dirname ${BASH_SOURCE[0]}); pwd)
PROJECT_DIRECTORY=$(cd $SCRIPT_DIRECTORY/..; pwd)
TEST_DIRECTORY=$PROJECT_DIRECTORY/test
TEST_PROJECT_DIRECTORY=$TEST_DIRECTORY/project

if [ ! -d $TEST_PROJECT_DIRECTORY ]; then
    rm -rf $TEST_PROJECT_DIRECTORY
    mkdir $TEST_PROJECT_DIRECTORY
    cd $TEST_DIRECTORY
    ${PROJECT_DIRECTORY}/node_modules/.bin/hexo init $TEST_PROJECT_DIRECTORY
    cp -r $TEST_DIRECTORY/images $TEST_PROJECT_DIRECTORY/source/images
fi

${PROJECT_DIRECTORY}/node_modules/.bin/ts-node ${TEST_DIRECTORY}/setupConfig.ts

cd $TEST_PROJECT_DIRECTORY
npm install
