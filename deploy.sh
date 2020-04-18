#!/bin/bash

declare -r REPO_ROOT=$(dirname $BASH_SOURCE)

if [ "$1" = "prod" ]; then
	declare -r BASE_HREF='/domino/'
	declare -r SITE_DIR=kycsar@kycsar.com:/var/www/html/kycsar/dev/domino
	declare -r API_DIR=kycsar@kycsar.com:/var/www/html/kycsar/dev/domino/api
else
	echo "Please specify one of [dev/prod] as deploy target"
	exit
fi

ng build --aot --prod --base-href $BASE_HREF
if [ "$2" = "go" ];then
	rsync -rltzuv --itemize-changes --delete -O $REPO_ROOT/dist/domino/ $SITE_DIR
	rsync -rltzuv --itemize-changes --delete -O $REPO_ROOT/api/ $API_DIR
else
	rsync -rltzuv --itemize-changes --delete -O --dry-run $REPO_ROOT/dist/domino/ $SITE_DIR
	rsync -rltzuv --itemize-changes --delete -O --dry-run $REPO_ROOT/api/ $API_DIR
fi
