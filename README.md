# MHEWS (Multi Hazard Early Warning System)
[![Build Status](https://travis-ci.org/takeshi4126/mhews.svg?branch=master)](https://travis-ci.org/takeshi4126/mhews)
[![Code Climate](https://codeclimate.com/github/takeshi4126/mhews/badges/gpa.svg)](https://codeclimate.com/github/takeshi4126/mhews)
[![Test Coverage](https://codeclimate.com/github/takeshi4126/mhews/badges/coverage.svg)](https://codeclimate.com/github/takeshi4126/mhews/coverage)
[![Dependency Status](https://gemnasium.com/badges/github.com/takeshi4126/mhews.svg)](https://gemnasium.com/github.com/takeshi4126/mhews)

## Introduction
This repository contains the code of the smartphone app to deliver weather information and hazard early warnings. It was developed for the [Samoa Meteorology Division](http://www.samet.gov.ws/) to deliver the information and alerts to the people in Samoa. We decided to make it open-source, because the app or a part of it may be useful for weather offices in other countries.

The app was developed by using [Meteor](https://www.meteor.com/) (with [Apache Cordova](https://cordova.apache.org/) plugins) and [Reactjs](https://facebook.github.io/react/) as the main platforms.
Meteor is a full-stack framework for building Javascript application, both the server and clients.
By using the Cordova plugin the client side of the app can run on smartphones.
Reactjs is a declarative UI library to make the UI development easy and keep the code clean.

## Screenshots of the app
Please find them on the [Google Play](https://play.google.com/store/apps/details?id=ws.gov.samet.mhews)

## System overview
The weather information and warnings are pushed to the smartphones by using the Meteor's Collection and Publish Subscribe mechanism while the app is running in front. Please read the Meteor's documents and guides to understand these mechanisms.
In addition, [Google Firebase Clound Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging/) is used for disseminating hazard early warnings while the app is running in the background or is closed.

![System overview](https://github.com/takeshi4126/mhews/wiki/images/MHEWS_system_overview.png)

## Prerequisite
- Android SDK https://developer.android.com/studio/index.html
- Meteor https://www.meteor.com/install
- Firebase Cloud Messaging (FCM) API key https://firebase.google.com/docs/cloud-messaging/
- Google Maps API key https://developers.google.com/maps/

## Install

```
git clone https://github.com/takeshi4126/mhews.git
cd mhews
meteor npm install
```

## How to run the app
The first step is to run the app in your development PC.

1. Copy settings_template.json to settings.json, and set the FCM and Google Maps API keys
2. Connect your Android phone to your PC (The phone must be in the debug mode.)
3. meteor run android-device --settings=settings.json

The server runs on your PC and the Android phone needs to access it. So, your PC and phone must be connected to the same LAN (e.g. connect both to the same WiFi router).

Also, you can access http://localhost:3000 to see the app in your PC's browser.

## How to deploy the app

The brief instruction for deploying the app to a server and client is described below. For simplicity, shell scripts are prepared under private/deploy_scripts directory.

Please read the Meteor's [Mobile guide](https://guide.meteor.com/mobile.html) for further details.

### Server

The server part of the app is deployed by using the [Meteor Up (mup)](https://github.com/zodern/meteor-up) tool. mup creates a docker container for running the server part of the app, and deploy the docker container to the server machine, according to the configuration file mup.js. Read the document of the mup project for further details. You must prepare the mup.js file by yourself as the content depends on your environment.

### Client

meteor build command creates the apk file. The apk file should be signed by using the keytool and jarsigner. And then, the signed apk file can be installed into your phone by using adb command. The signed apk file can also be uploaded to the Google Play so that your users can downloaded it.

## File structure
This project tries to follow the Meteor's recommended file structure. https://guide.meteor.com/structure.html

- client: Contains the main.js as the client application's entry point.
- server: Contains the main.js as the server application's entry point.
- imports: The contents under this directory is imported by the client and server code.
  - api: Contains the API javascripts with the following sub-directories:
    - client: Client-only code
    - server: Server-only code
    - model: Contains some entity classes like weather, warning, etc.
  - startup: Startup code for client and server.
  - ui: Contains the pages referred to by the React router.
    - components: Contains the UI components used by the pages.
- public: Image files and sound files to be rendered by the clients.
- private: Files in this directory are not exposed to the clients.
- locales: Dictionary files. One for each language to be supported.

## Development
Please feel free to fork the repository and create your own app.

If you use Meteor and Reactjs for the first time, it is highly recommended to go through the tutorials.
- Reactjs tutorial: https://facebook.github.io/react/tutorial/tutorial.html
- Meteor tutorial (React version): https://www.meteor.com/tutorials/react/creating-an-app

### Change the language
1. In the locale directory, copy the en.common.js file for your language (e.g. ja.common.js for Japanese) and edit the contents. The first part of the file name represents the language code. It doesn't have to be two digits as far as it is unique.
2. Add the language code to the "language" property of config.js

### Test
Test cases are written by using [mocha](https://mochajs.org/), [chai](http://chaijs.com/), and [sinon](http://sinonjs.org/). Test cases are named like "xxx.test.js" where "xxx" part is the name of the file to be tested. Existing test cases can be run by the command below:
```
npm test
```
and then opening "localhost:3000" in a browser will show the result.

### Contribution
The author of this app is currently working at the [Samoa Meteorology Division](http://www.samet.gov.ws/) as a volunteer from [JICA](https://www.jica.go.jp/english/index.html) (Japan International Cooperation Agency).
Due to other tasks as a volunteer I cannot spend much time on further development of this app.
If you're interested in helping me add more features into this app, please contact me.

## License
MIT license (c) Samoa Meteorology Division, 2017
