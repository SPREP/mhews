import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppWithMenu from './AppWithMenu.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';

/**
 * This is needed for the material-ui components handle click event.
 */
injectTapEventPlugin();

const App = () => (
  <MuiThemeProvider>
    <AppWithMenu />
  </MuiThemeProvider>
);

export default App;
