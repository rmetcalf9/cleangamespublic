#!/bin/bash

WORKTREE_TMP_DIR=/tmp/pwa-publish
if [[ -d ${WORKTREE_TMP_DIR} ]]; then
  rm -rf ${WORKTREE_TMP_DIR}
fi

##git subtree pull --prefix=dist/spa origin gh-pages (If change made upstream)
export START_DIR=$(pwd)
export GITROOT=${START_DIR}
VERSIONFILE=${GITROOT}/VERSION

echo "Running tests"
npm run test:unit:ci
RES=$?
if [ ${RES} -ne 0 ]; then
  echo "ERROR - unit tests not passing"
  exit 1
fi

echo "Bump version (Versionfile=${VERSIONFILE})"
#Find minor version - text AFTER last dot in version string
OLDVERSION=$(cat ${VERSIONFILE})
OLDMINORVERSION=$(echo ${OLDVERSION} | sed 's/.*\.//')
CHARSINFIRSTPART=$(expr ${#OLDVERSION} - ${#OLDMINORVERSION})
RES=$?
if [ ${RES} -ne 0 ]; then
  echo "Invalid version number"
  exit 1
fi
OLDVERSIONWITHOUTMINOR=${OLDVERSION:0:${CHARSINFIRSTPART}}
RES=$?
if [ ${RES} -ne 0 ]; then
  echo "Invalid version number (Can't get first part)"
  exit 1
fi
NEWVERSION=${OLDVERSIONWITHOUTMINOR}$(expr ${OLDMINORVERSION} + 1)
echo "Bumped to version ${NEWVERSION}"

echo ${NEWVERSION} > ${VERSIONFILE}
printf "/* eslint-disable */\nexport default { codebasever: '${NEWVERSION}' }\n" > ./src/rjmversion.js

quasar build -m pwa

echo "Updating CNAME"
echo "game.metcarob.com" > dist/pwa/CNAME


cp -r ./redirects/* ./dist/pwa

git add --all
git commit -m"New website version ${NEWVERSION}"
git push

# 1. Create a temporary worktree for the publish branch
git worktree add ${WORKTREE_TMP_DIR} publish/main

# 2. Copy the contents of dist/pwa into the worktree
rsync -av --delete --exclude='.git' dist/pwa/ ${WORKTREE_TMP_DIR}

# 3. Commit and push
cd /tmp/pwa-publish
git add .
git commit -m "Deploy latest PWA build"
git push publish main

# 4. Clean up
cd ${START_DIR}
git worktree remove ${WORKTREE_TMP_DIR}

echo "Finished deploying version ${NEWVERSION}"
