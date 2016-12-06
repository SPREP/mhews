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
import {WarningList, WarningsMenuTile} from './WarningList.jsx';
import {WeatherPage, WeatherMenuTile} from './Weather.jsx';
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

    console.log("DrawerMenu.render(): drawerOpen = "+this.props.drawerOpen);

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
    this.fcmdata = null;

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });
  }

  componentDidMount(){
    if( Meteor.isCordova ){
      Meteor.defer(()=>{ this.initfcm();});
    }
    if( Meteor.isClient ){
      Meteor.defer(()=>{
        // To receive the data from the weatherForecast collection
        Meteor.subscribe('weatherForecast');

        // To receive the data from the warnings collection
        Meteor.subscribe('warnings');
      });
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

  handleFcmNotification(data){
    console.log("FCM data received.");
    this.fcmdata = data;

    const config = Meteor.settings.public.notificationConfig[data.type];
    if( !config ){
      console.error("Unknown hazard type "+data.type);
      return;
    }

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
    if( !this.fcmdata.wasTapped ){ playSound(config.sound);}
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
        return React.createElement(
          getReactComponentByName(pageConfig.component),
          {...this.props,
            phenomena: this.fcmdata,
            onPageSelection: (page) => { this.handlePageSelection(page)}
          }
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
    console.log("toggle drawer open from "+this.state.drawerOpen+" to "+open);
    this.setState({drawerOpen: open});
  }
  render(){
    const t = this.props.t;
    const pageConfig = getPageConfig(this.state.page);
    const title = pageConfig.title;

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
