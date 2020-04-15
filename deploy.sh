#!/bin/bash

declare -r EXCLUDES=$(dirname $BASH_SOURCE)/exclude.txt
declare -r REPO_ROOT=$(dirname $BASH_SOURCE)

if [ "$1" = "dev" ]; then
	declare -r TARGET_DIR=/var/www/html/domino
elif [ "$1" = "prod" ]; then
	declare -r BASE_HREF='/domino/'
	declare -r SITE_DIR=kycsar@kycsar.com:/var/www/html/kycsar/dev/domino
else
	echo "Please specify one of [dev/prod] as deploy target"
	exit
fi

ng build --aot --prod --base-href $BASE_HREF
if [ "$2" = "go" ];then
	rsync -rltzuv --itemize-changes --delete -O --exclude-from $EXCLUDES $REPO_ROOT/dist/domino/ $SITE_DIR
else
	rsync -rltzuv --itemize-changes --delete -O --dry-run --exclude-from $EXCLUDES $REPO_ROOT/dist/domino/ $SITE_DIR
fi
