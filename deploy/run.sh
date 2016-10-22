#!/bin/bash

eval "$(ssh-agent -s)" # Start the ssh agent
chmod 600 deploy/deploy.key # This key should have push access
ssh-add deploy/deploy.key
git remote add deploy dokku@darkcooger.net:jotc-staging.darkcooger.net
git push deploy development:master
