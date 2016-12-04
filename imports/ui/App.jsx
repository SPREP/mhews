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

/* Key to lookup the next page. Also this strings are used as the key for translation */

export const Pages = {
  indexPage : 'IndexPage',
  weatherPage : 'Weather',
  earthquakePage : 'Earthquake',
  cyclonePage : 'Cyclone',
  heavyRainPage: 'HeavyRain',
  aboutSMDPage : 'AboutSMD',
  warningListPage : 'Warnings',
  aboutApp: 'AboutApp',
  languagePage: 'Language'
}

/**
 * This is needed for the material-ui components handle click event.
 */
injectTapEventPlugin();

const TopLeftMenu = (props) => (
  <IconMenu
    {...props}
    iconButtonElement={
      <IconButton><MenuIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    // FIXME props.onClick is not defined.
    onItemTouchTap={(event, menuItem) => {
      event.preventDefault();
      props.onPageSelection(menuItem.props.value);
    }}
    >
    <MenuItem primaryText={props.t("IndexPage")} value={Pages.indexPage} />
    <MenuItem primaryText={props.t("menu.language")} value={Pages.languagePage} />
    <MenuItem primaryText={props.t("menu.about")} value={Pages.aboutSMDPage} />
  </IconMenu>
);

const notificationConfig = {
  "earthquake" : {
    sound: "sounds/tsunami_warning.wav",
    page: Pages.earthquakePage,
    useLocation: false,
  },
  "tsunami" : {
    sound: "sounds/tsunami_warning.wav",
    page: Pages.earthquakePage,
    useLocation: false,
  },
  "cyclone" : {
    sound: "sounds/tsunami_warning.wav",
    page: Pages.cyclonePage,
    useLocation: true,
  },
  "heavyRain" : {
    sound: "sounds/tsunami_warning.wav",
    page: Pages.heavyRainPage,
    useLocation: true,
  }
}

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Pages.indexPage
    }
    this.fcmdata = null;

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });

    if( Meteor.isCordova ){
      this.initfcm();
    }
  }
  handlePageSelection(page){
    this.setState({page: page});
  }
  onBackKeyDown(){
    if( this.state.page == Pages.indexPage){
      navigator.app.exitApp();
    }
    else{
      this.handlePageSelection(Pages.indexPage);
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

    const config = notificationConfig[data.type];
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
    if( this.state.page == Pages.indexPage ){
      return <IndexPage {...this.props} onPageSelection={(page) => { this.handlePageSelection(page); }}/>
    }
    else if( this.state.page == Pages.weatherPage ){
      return <WeatherPage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == Pages.earthquakePage ){
      return <EarthquakePage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == Pages.heavyRainPage ){
      return <HeavyRainPage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == Pages.cyclonePage ){
      return <CyclonePage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == Pages.languagePage ){
      return <LanguageSetting {...this.props} onPageSelection={(page) => {this.handlePageSelection(page);}}/>
    }
    else if( this.state.page == Pages.aboutSMDPage ){
      return <AboutSMDPage {...this.props} />
    }
    else if( this.state.page == Pages.warningListPage ){
      return <WarningList {...this.props} onPageSelection={(page) => { this.handlePageSelection(page); }}/>
    }
    else {
      console.error("Unknown page state:" + this.state.page);
      return <IndexPage {...this.props} onPageSelection={(page) => { this.handlePageSelection(page); }}/>
    }
  }

  render(){
    const t = this.props.t;
    const title = this.state.page;

    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={t(title)}
            iconElementLeft={<TopLeftMenu {...this.props} onPageSelection={(page) => {this.handlePageSelection(page); }}/>}
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

const tilesData = [
{
  img: 'images/earthquake_menu.jpg',
  title: 'title.eqtsunami',
  page: Pages.earthquakePage,
  contents: <EarthquakePage />
},
{
  img: 'images/cyclone_menu.jpg',
  title: 'title.cyclone',
  page: Pages.cyclonePage,
  contents: <CyclonePage />
},
{
  img: 'images/samet_icon.jpg',
  title: 'title.about',
  page: Pages.aboutSMDPage,
  contents: <AboutSMDPage />
},
];

class IndexPage extends React.Component {

  render(){
    const t = this.props.t;

    return(
      <div>
        <List>
          <WeatherMenuTile {...this.props} onTouchTap={() => {this.props.onPageSelection(Pages.weatherPage)}} />
          <WarningsMenuTile {...this.props} onTouchTap={() => {this.props.onPageSelection(Pages.warningListPage)}} />
        </List>

        <GridList
          cellHeight={100}
          cols={2}
          style={styles.gridList}
          >

          {tilesData.map((tile) => (
            <GridTile
              key={tile.title}
              title={t(tile.title)}
              onTouchTap={() => {this.props.onPageSelection(tile.page)}}
              >
              <img src={tile.img} />
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }
}

export default translate(['common'])(App);
