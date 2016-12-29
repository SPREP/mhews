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

Meteor.startup(() => {
  console.log("Meteor.startup() -- ");

  i18n.init(i18nConfig);
  renderApp();

  Reloader.configure({
    check: false, // Check for new code every time the app starts
    refresh: 'start', // Refresh to already downloaded code on start (not on resume)
    idleCutoff: 1000 * 60 * 10  // Wait 10 minutes before treating a resume as a start
  });
  
  if( Meteor.isCordova ){
    const fcmInitializer = ()=>{
      initFcmClient((data)=>{
        handleFcmNotification(data)
      });
    };

    Meteor.defer(fcmInitializer);

    // The plugin stops receiving FCM data after the device has been paused and resumed again.
    // Reinitialize the plugin on the resume event.
//    document.addEventListener(
//      "resume",fcmInitializer, false
//    );
  }

  /**
  * This is needed for the material-ui components handle click event.
  * shouldRejectClick disables the onClick, but this is needed to avoid ghost click.
  */
  if( Meteor.isCordova ){

    injectTapEventPlugin({
      shouldRejectClick: function () {
        return true;
      }
    });
  }
  else{
    injectTapEventPlugin();
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
  if( Meteor.isCordova ){
    navigator.splashscreen.hide();
  }
  Meteor.defer(()=>{
    Preferences.init();
  });

  // FIXME Better way to catch this event??
  const intervalId = setInterval(()=>{
    if( Preferences.isLoaded()){
      prefLoaded.set(true);
      clearInterval(intervalId);
    }
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
  if( !fcmData.wasTapped ){
    // Need to notify the user of the new bulletin.
    if(Warnings.changeNeedsAttention(warning)){
      playSound(config.sound);
    }
  }
}
