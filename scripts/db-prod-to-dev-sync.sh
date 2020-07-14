#!/bin/bash

export DB_NAME_FROM=
export DB_NAME_TO=
export MONGODB_URI_FROM=
export MONGODB_URI_TO=


export OUT_DIR=tmp/$(date +'%Y-%m-%d-%H-%M')
export GZ_NAME=wikiloop-doublecheck-prod.gz

echo "Start backing up to $OUT_DIR/$GZ_NAME"
mkdir -p $OUT_DIR/

mongodump \
  --uri="$MONGODB_URI_FROM" \
  --gzip \
  --archive=$OUT_DIR/$GZ_NAME
echo "Saved to $OUT_DIR/$GZ_NAME"

echo "Now restoring"

mongorestore \
  --uri="$MONGODB_URI_TO" \
  --drop --gzip \
  --archive=$OUT_DIR/$GZ_NAME \
  --nsFrom "${DB_NAME_FROM}.*" \
  --nsTo "${DB_NAME_TO}.*"

echo "Done"
