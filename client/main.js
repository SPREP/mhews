import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppContainer, {phenomenaVar} from '../imports/ui/App.jsx';

/* i18n */
import { I18nextProvider } from 'react-i18next';
import i18nConfig from '../imports/api/i18n.js';
import i18n from 'i18next';

import {initFcmClient} from '../imports/api/fcm.js';
import {Warnings} from '../imports/api/warnings.js';
import {playSound} from '../imports/api/mediautils.js';

Meteor.startup(() => {

  // Retrieve the language setting from the local collection
  if (typeof(Storage) !== "undefined") {
    console.log("Loading language preference.");
    const lang = localStorage.getItem("language")
    if( lang ){
      i18nConfig.lng = lang;
    }
  }
  i18n.init(i18nConfig);
  renderApp();

  if( Meteor.isCordova ){
    Meteor.defer(()=>{
      initFcmClient((data)=>{
        handleFcmNotification(data)
      });
    });
  }


  });

function renderApp(){

  render(
    <I18nextProvider i18n={ i18n }>
      <MuiThemeProvider>
        <AppContainer />
      </MuiThemeProvider>
    </I18nextProvider>,
      document.getElementById('render-target')
    );
}

function handleFcmNotification(fcmData){
  console.log("FCM data received.");

  const config = Meteor.settings.public.notificationConfig[fcmData.type];
  if( !config ){
    console.error("Unknown hazard type "+fcmData.type);
    return;
  }
  const warning = Warnings.fromFcmMessage(fcmData);

  phenomenaVar.set(warning);
  if( !fcmData.wasTapped ){ playSound(config.sound);}
}
