#!/bin/sh

set -e;

if ! git diff-files --quiet; then
    echo "Can not publish with unstaged uncommited changes";
    exit 1;
fi;

if ! git diff-index --quiet --cached HEAD; then
    echo "Can not publish with staged uncommited changes";
    exit 1;
fi;

#npm test;
echo "Running patch"
npm version patch;
echo "patched"

echo "Running push"
git push;
echo "pushed"

echo "Running push tags"
git push --tags;
echo "pushed"

echo "running publish"
npm publish;
echo "published"
