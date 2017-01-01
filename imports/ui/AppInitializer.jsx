import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import InitPageContainer from './InitPage.jsx';
import {Preferences} from '../api/client/preferences.js';

import AppContainer from './App.jsx';
import { createContainer } from 'meteor/react-meteor-data';

import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

class AppInitializer extends React.Component {

  render(){
    console.log("AppInitializer.render() - loaded = "+this.props.loaded+" appInitialized = "+this.props.appInitialized);
    hideSplashScreen();

    if( !this.props.loaded ){
      return (<p>Loading data...</p>);
    }
    else {
      // reload the appInitialized again here.
      // Although it is given as the property, there is a case where "props.loaded" has triggered
      // rerendering before the appInitialized returns the saved preference value.
      const appInitialized = Preferences.load("appInitialized");

      return (
        <I18nextProvider i18n={ i18n }>
          <MuiThemeProvider>
            {appInitialized ? this.renderAppContainer() : this.renderInitPage()}
          </MuiThemeProvider>
        </I18nextProvider>
      )
    }
  }

  renderInitPage(){
    return (
      <InitPageContainer {...this.props} onFinished={()=>{
        console.log("InitPageContainer.onFinished()");
        Preferences.save("appInitialized", true);
      }}
    />);
  }

  renderAppContainer(){
    return(
      <AppContainer {...this.props} />
    );
  }
}

function hideSplashScreen(){
  if( Meteor.isCordova ){
    navigator.splashscreen.hide();
  }
}

AppInitializer.propTypes = {
  loaded: React.PropTypes.bool,
  appInitialized: React.PropTypes.bool
}

const AppInitializerContainer = createContainer(()=>{
  return {
    loaded: Preferences.isLoaded(),
    appInitialized: Preferences.load("appInitialized")
  }

},AppInitializer);

export default AppInitializerContainer;
