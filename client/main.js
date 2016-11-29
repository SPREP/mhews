import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
/* i18n */
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js'; // initialized i18next instance

import TranslatableView from '../imports/ui/TranslatableView.jsx';

Meteor.startup(() => {

  render(
    <I18nextProvider i18n={ i18n }><App /></I18nextProvider>,
    document.getElementById('render-target'));
});
