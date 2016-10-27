#!/bin/bash

echo "de beginning"
cat deploy/deploy.key
echo "Whoop whoop"
eval "$(ssh-agent -s)" # Start the ssh agent
echo "two"
chmod 600 deploy/deploy.key # This key should have push access
echo "three"
ssh-add deploy/deploy.key
echo "four"
git remote add deploy dokku@darkcooger.net:jotc-staging.darkcooger.net
echo "four-point-five"
cat deploy/ssh-signature >> ~/.ssh/known_hosts
echo "five"
git push deploy master
echo "six"
