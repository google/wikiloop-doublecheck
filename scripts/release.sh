#!/usr/bin/env bash
echo "release script called .. "

# According to https://devcenter.heroku.com/articles/release-phase
echo "npm run build # So the promoted heroku app in pipeline can have new ENV variables in the built binary. See "
echo "AXIOS_BASE_URL = $AXIOS_BASE_URL"
npm run build
echo "release script execution completed!"
