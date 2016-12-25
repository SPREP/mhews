import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import InitPageContainer from '../imports/ui/InitPage.jsx';
import {Preferences} from '../imports/api/preferences.js';

import AppContainer, {phenomenaVar} from '../imports/ui/App.jsx';
import { createContainer } from 'meteor/react-meteor-data';

/* i18n */
import { I18nextProvider } from 'react-i18next';
import i18nConfig from '../imports/api/i18n.js';
import i18n from 'i18next';

import {initFcmClient} from '../imports/api/fcm.js';
import {Warnings} from '../imports/api/warnings.js';
import {playSound} from '../imports/api/mediautils.js';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

/* global Reloader */

Reloader.configure({
  check: 'firstStart', // Only make an additonal check the first time the app ever starts
  checkTimer: 5000,  // Wait 5 seconds to see if new code is available on first start
  refresh: 'start' // Only refresh to already downloaded code on a start and not a resume
});

Meteor.startup(() => {
  console.log("Meteor.startup() -- ");

  i18n.init(i18nConfig);
  renderApp();

  if( Meteor.isCordova ){
    Meteor.defer(()=>{
      initFcmClient((data)=>{
        handleFcmNotification(data)
      });
    });

/**
 * This is needed for the material-ui components handle click event.
 * shouldRejectClick disables the onClick, but this is needed to avoid ghost click.
 */
    injectTapEventPlugin({
      shouldRejectClick: function () {
        return true;
      }
    });
  }
});

function renderApp(){

  render(
    <AppInitializerContainer />,
    document.getElementById('render-target')
  );
}

class AppInitializer extends React.Component {

  constructor(props){
    super(props);
    this.state = {appInitialized: props.appInitialized};
  }

  render(){
    console.log("AppInitializer.render() - loaded = "+this.props.loaded + ", appInitialized = "+this.state.appInitialized);

    if( !this.props.loaded ){
      return (<p>Loading preferences...</p>);
    }
    else {
      const appInitialized = Preferences.load("appInitialized") || this.state.appInitialized;

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
        this.appInitialized();
      }}
    />);
  }

  renderAppContainer(){
    return(
      <AppContainer {...this.props} />
    );
  }

  appInitialized(){
    this.setState({appInitialized: true});
  }
}

AppInitializer.propTypes = {
  loaded: React.PropTypes.bool,
  appInitialized: React.PropTypes.bool
}

const prefLoaded = new ReactiveVar(false);

const AppInitializerContainer = createContainer(()=>{
  navigator.splashscreen.hide();
  Meteor.defer(()=>{
    Preferences.init();
  });

  // FIXME Better way to catch this event??
  setInterval(()=>{
    prefLoaded.set(Preferences.isLoaded());
  }, 100);

  return {
    loaded: prefLoaded.get(),
    appInitialized: Preferences.load("appInitialized")
  }

},AppInitializer)

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
