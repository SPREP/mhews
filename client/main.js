import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import AppInitializerContainer from '../imports/ui/AppInitializer.jsx';

// startup code of the client
import '../imports/startup/client/init.js';

Meteor.startup(() => {
  console.log("Meteor.startup() -- ");

//  renderApp();
});

function renderApp(){
  console.log("Enter renderApp()");

  render(
    <AppInitializerContainer />,
    document.getElementById('render-target')
  );
}
