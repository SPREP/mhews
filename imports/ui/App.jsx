import React from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {GridList, GridTile} from 'material-ui/GridList';
import List from 'material-ui/List/List';
import Drawer from 'material-ui/Drawer';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
//import {WarningList, WarningsMenuTile} from './WarningList.jsx';
import WarningListContainer from './WarningList.jsx';
//import {WeatherPage, WeatherMenuTile} from './Weather.jsx';
import WeatherPageContainer from './Weather.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';
import HeavyRainPage from './HeavyRain.jsx';
import AboutSMDPage from './AboutSMD.jsx';
import LanguageSetting from './LanguageSetting.jsx';
import * as HazardArea from '../api/hazardArea.js';

const disasterNotificationTopic = 'disaster';

/**
 * This is needed for the material-ui components handle click event.
 */
injectTapEventPlugin();

class DrawerMenu extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const menu = Meteor.settings.public.menu;
    const pages = Meteor.settings.public.pages;
    const children = menu.map((pageName) => {
      const page = pages[pageName];
      const title = page.title;
      return (
        <MenuItem
          key={title}
          onTouchTap={
            (event, menuItem) => {
              event.preventDefault();
              this.props.onRequestChange(false);
              this.props.onPageSelection(pageName);
            }
          }
          primaryText={this.props.t(title)}
          value={pageName}
          />);
    });

    return React.createElement(
      Drawer,
      {
        docked: false,
        open: this.props.drawerOpen,
        onRequestChange: this.props.onRequestChange
      },
      children
    );

  }
}

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Meteor.settings.public.topPage,
      drawerOpen: false
    }
    // Phenomena to be displayed by the Earthquake and HeavyRain page.
    // The phonomena is set by the FCM or by the user's selection in the WarningList page.
    this.phenomena = null;
    this.handles = null;

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });
  }

  componentDidMount(){
    if( Meteor.isCordova ){
      Meteor.defer(()=>{ this.initfcm();});
    }
  }

  handlePageSelection(page){
    this.setState({page: page});
  }
  onBackKeyDown(){
    const topPageName = Meteor.settings.public.topPage;

    if( this.state.page == topPageName){
      navigator.app.exitApp();
    }
    else{
      this.handlePageSelection(topPageName);
    }
  }

  // Initialize the FCM plugin
  initfcm() {

    FCMPlugin.subscribeToTopic(disasterNotificationTopic);

    FCMPlugin.onNotification(
      (data) => {
        this.handleFcmNotification(data);
      },
      (msg) => {
        console.log('onNotification callback successfully registered: ' + msg);
      },
      (err) => {
        console.error('Error registering onNotification callback: ' + err);
        // TODO Need to handle this error. Try to re-subscribe to the topic until it succeeds?
      }
    );
  }

  setPhenomena(data){
    this.phenomena = data;
  }

  handleFcmNotification(fcmData){
    console.log("FCM data received.");

    const config = Meteor.settings.public.notificationConfig[fcmData.type];
    if( !config ){
      console.error("Unknown hazard type "+fcmData.type);
      return;
    }
    const data = convertFcmDataToHazardDataStructure(fcmData);

    this.setPhenomena(data);

    if( config.useLocation ){
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if( HazardArea.maybeInHazardArea(pos, data)){
            this.notifyUserAndChangePage(config);
          }
        },
        (error) => {
          console.error("Failed to obtain the current location.");
          // Notify the user just in case, as the user may be in the hazard area.
          this.notifyUserAndChangePage(config);
        },
        { maximumAge: 10*60*1000, // Cached position within 10min is accepted.
          timeout: 30000, // 30 seconds to wait for the positioning.
          enableHighAccuray: true
        }
      );
    }
    else{
      this.notifyUserAndChangePage(config);
    }
  }

  notifyUserAndChangePage(config){
    if( !this.phenomena.wasTapped ){ playSound(config.sound);}
    this.setState({page: config.page});
  }

  /**
  * Handle state change caused by the user choosing a menu.
  */
  renderContents(){
    const page = this.state.page;
    const pageConfig = getPageConfig(page);
    if( pageConfig ){
      if( pageConfig.component ){
        const props = {
          ...this.props,
          phenomena: this.phenomena,
          handles: this.handles,
          onPageSelection: (page, phenomena) => {
            if( phenomena ){
              this.setPhenomena(phenomena);
            }
            this.handlePageSelection(page);
          }
        };
        return React.createElement(
          getReactComponentByName(pageConfig.component),
          props
        );
      }
      else{
        console.error("Config for page " + page +" does not contain component property. Check your settings.json.");
      }
    }
    else{
      console.error("Unknown page state:" + this.state.page);
    }
    return (<div>Choose a content from the top-left menu</div>);
  }

  toggleDrawerOpen(){
    this.setDrawerOpen(!this.state.drawerOpen);
  }

  setDrawerOpen(open){
    this.setState({drawerOpen: open});
  }
  render(){
    const t = this.props.t;
    const pageConfig = getPageConfig(this.state.page);
    const title = pageConfig.title;

    // TODO This code should be moved to a container wrapping the App.
    if( Meteor.isClient ){
      if( this.handles == null ){
        this.handles = {};
        // To receive the data from the weatherForecast collection
        this.handles.weatherForecast = Meteor.subscribe('weatherForecast');

        // To receive the data from the warnings collection
        this.handles.warnings = Meteor.subscribe('warnings');
      }
    }

    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={t(title)}
            onLeftIconButtonTouchTap={()=>{this.toggleDrawerOpen()}}
            iconElementLeft={<IconButton><MenuIcon /></IconButton>}
            />
          <DrawerMenu {...this.props}
            drawerOpen={this.state.drawerOpen}
            onRequestChange={(open)=>{this.setDrawerOpen(open);}}
            onPageSelection={(page) => {this.handlePageSelection(page);}}
            />

          {this.renderContents()}
        </div>
      </MuiThemeProvider>

    );

  }
}

// FCM cannot deliver layered JSON, so epicenter is represented by two attributes.
// This function put them back into the same data structure as a client publishes to the server.
function convertFcmDataToHazardDataStructure(data){
  data.epicenter = {
    lat: parseFloat(data.epicenter_lat),
    lng: parseFloat(data.epicenter_lng),
  }
  data.mw = parseFloat(data.mw);
  data.depth = parseFloat(data.depth);

  return data;
}

function playSound(file){
  // TODO It seems the code below does not work well with iOS
  // http://stackoverflow.com/questions/36291748/play-local-audio-on-cordova-in-meteor-1-3

  const url = document.location.origin+"/"+file;
  console.log("url = "+url);
  let media = new Media(url,
    ()=>{
      console.log("Media success.");
      media.release();
    },
    (err)=>{
      console.error("Media error: "+err.message);
    }
  );

  if( media ){
    media.play();
  }
  else{
    console.error("media is not defined or null.");
  }
}

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 300,
    overflowY: 'auto',
  },
};

function getPageConfigsForGrid(){
  const configs = getPageConfigs();
  let configsForGrid = [];

  configs.forEach((config)=>{
    if( config.useGrid ){
      configsForGrid.push(config);
    }
  });
  return configsForGrid;
}

function getPageConfig(page){
  const config = Meteor.settings.public.pages[page];
  config.key = page;
  return config;
}

function getPageConfigs(){
  const pages = Meteor.settings.public.pages;
  let configs = [];

  for(let key in pages){
    let page = pages[key];
    page.key = key;
    configs.push(page);
  }

  return configs;
}

function getReactComponentByName(componentName){
  return eval(componentName);
}

export default translate(['common'])(App);
