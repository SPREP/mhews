# MHEWS (Multi Hazard Early Warning System)

This README file is still under drafting and thus does not provide enough information to use the code in this repository. Work in progress.

## Introduction
This repository contains the smartphone app to deliver weather information and hazard early warnings. It was developed for the [Samoa Meteorology Division](http://www.samet.gov.ws/) to deliver the information and alerts to the people in Samoa. We decided to make it open-source, because the app or a part of it may be useful for weather offices in other countries.

The app was developed by using [Meteor](https://www.meteor.com/) (with [Apache Cordova](https://cordova.apache.org/) plugins) and [Reactjs](https://facebook.github.io/react/
) as the main platforms.
Meteor is a full-stack framework for building Javascript application, both the server and clients.
By using the Cordova plugin the client side of the app can run on smartphones.
Reactjs is a declarative UI library.

## Screenshots of the app
Please find it on the [Google Play](https://play.google.com/store/apps/details?id=ws.gov.samet.mhews)

## System overview
The weather information and warnings are delivered by using the Meteor's Collection and Publish Subscribe mechanism while the app is running in front. Please read the Meteor's documents and guides to understand these mechanisms.
In addition, [Google Firebase Clound Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging/) is used for delivering hazard early warnings while the app is running in the background or is closed.

![System overview](https://github.com/takeshi4126/mhews/wiki/images/MHEWS_system_overview.png)

## Prerequisite
- Android SDK https://developer.android.com/studio/index.html
- Meteor https://www.meteor.com/install
- Firebase Cloud Messaging (FCM) API key https://firebase.google.com/docs/cloud-messaging/
- Google Maps API key https://developers.google.com/maps/

## How to run the app
1. git clone https://github.com/takeshi4126/mhews.git
2. cd mhews
3. meteor npm install
4. Edit the settings.json to set the FCM and Google Maps API keys
5. Connect your Android phone to your PC (The phone must be in the debug mode.)
6. meteor run android-device --settings=settings.json

The server runs on your PC and the Android phone needs to connect to it. So, your PC and phone must be connected to the same LAN (e.g. connected to the same WiFi AP)

## File structure
This project follows the Meteor's recommended file structure. https://guide.meteor.com/structure.html

- client: Contains the main.js as the client application's entry point.
- server: Contains the main.js as the server application's entry point.
- imports: The contents under this directory is imported by the client and server code.
  - api: Contains the API javascripts with the following sub-directories:
    - client: Client-only code
    - server: Server-only code
    - model: Contains some entity classes like weather, warning, etc.
  - startup: Startup code for client and server.
  - ui: Contains the Reactjs UI code
- public: Image files and sound files to be rendered by the clients.
- private: Files in this directory are not exposed to the clients.

## Development
If you use Meteor and Reactjs for the first time, it is highly recommended to go through the tutorials.
- Reactjs tutorial: https://facebook.github.io/react/tutorial/tutorial.html
- Meteor tutorial (React version): https://www.meteor.com/tutorials/react/creating-an-app

### Change the language
i18n.js file under the api directory is the dictionary.
Please change the "ws" part of the file to your language.
setting.json contains the attribute called "languages" and your language must be added there, too.

### Contribution
The author of this app is currently working at the Samoa Meteorology Division as a volunteer from [JICA](https://www.jica.go.jp/english/index.html) (Japan International Cooperation Agency).
Due to other tasks as a volunteer I cannot spend much time on further development of this app.
If you're interested in helping me add more features into this app, please contact me.

## License
MIT license (c) Samoa Meteorology Division, 2017
