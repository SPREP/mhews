#!/bin/bash

export BUILD_OUTPUT_DIR=/Users/nrjmata/mhews_build/
export APPNAME=mhews
export KEYNAME=mhews
export BUILD_TOOLS_VER=25.0.0

rm -rf $BUILD_OUTPUT_DIR/android
rm -rf $BUILD_OUTPUT_DIR/ios
mkdir -p $BUILD_OUTPUT_DIR/android
mkdir -p $BUILD_OUTPUT_DIR/ios

meteor build $BUILD_OUTPUT_DIR --server=http://mhews.samet.gov.ws:3000 --mobile-settings=settings_release.json
cd $BUILD_OUTPUT_DIR/android/
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 release-unsigned.apk $KEYNAME
rm $APPNAME.apk
$ANDROID_HOME/build-tools/$BUILD_TOOLS_VER/zipalign 4 release-unsigned.apk $APPNAME.apk
