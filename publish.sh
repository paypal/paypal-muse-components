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

echo "running patch"
npm version patch;
echo "patched"

echo "running push"
git push;
echo "pushed"

echo "running push tags"
git push --tags;
echo "pushed"

echo "running push publish using code $2"
npm publish --otp=$2
echo "published"
