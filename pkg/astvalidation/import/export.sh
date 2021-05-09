#!/bin/bash

REPO_DIR=./graphql-js
EXPORTER_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$EXPORTER_ROOT" || exit

GIT_TAG=v15.5.0

if [[ -d "$REPO_DIR" ]] ; then
    echo "checkout graphql-js@${GIT_TAG}"
    cd "$REPO_DIR" || exit
    git checkout "$GIT_TAG"
else
    echo "cloning graphql-js@${GIT_TAG}"
    git clone --depth 1 --branch $GIT_TAG -- https://github.com/graphql/graphql-js $REPO_DIR
    cd "$REPO_DIR" || exit
    git checkout "$GIT_TAG"
fi

cd "$EXPORTER_ROOT" || exit

echo "installing js dependencies"
npm ci

echo "compiling graphql-js/src to CommonJS"
node compile.js

echo "exporting tests"
node export.js
