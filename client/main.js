import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
/* i18n */
import { I18nextProvider } from 'react-i18next';
import i18nConfig from '../imports/api/i18n.js';
import i18n from 'i18next';

Meteor.startup(() => {

  // Retrieve the language setting from the local collection
  if (typeof(Storage) !== "undefined") {
    console.log("Loading language preference.");
    const lang = localStorage.getItem("language")
    if( lang ){
      i18nConfig.lng = lang;
    }
  }
  console.log("Calling i18n.init");
  i18n.init(i18nConfig);
  console.log("Start rendering App.");
  renderApp();

  });

function renderApp(){

  render(
    <I18nextProvider i18n={ i18n }><App /></I18nextProvider>,
      document.getElementById('render-target')
    );
}
