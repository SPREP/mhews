import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';

Meteor.startup(() => {
  console.error("Before the render method.");

  render(<App />, document.getElementById('render-target'));
});
