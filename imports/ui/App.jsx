import React from 'react';
import { Meteor } from 'meteor/meteor';
import browserHistory from 'react-router/lib/browserHistory';

/* i18n */
import { translate } from 'react-i18next';

import {initAfterComponentMounted} from '../startup/client/init.js';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

/* Imports the mhews's components */
import WeatherForecasts from '../api/client/weather.js';
import FileCache from '../api/client/filecache.js';

import ConnectionStatusIndicatorContainer from './ConnectionStatusIndicator.jsx';
import DrawerMenu from './DrawerMenu.jsx';
import {quitApp} from '../api/client/appcontrol.js';
import {toTitleCase} from '../api/strutils.js';

import Config from '../config.js';

import './css/App.css';

/* global navigator */

const topPageName = Config.topPage;

const surfaceChartUrl = Config.cacheFiles.surfaceChart;

const satelliteImageUrl = Config.cacheFiles.satelliteImage;

class AppClass extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Config.topPage,
      drawerOpen: false,
      dialogOpen: false
    }
    this.isSoftwareUpdateConfirmed = false;
    this.onBackKeyDown = this.onBackKeyDown.bind(this);
  }

  handlePageSelection(page){
    if( page == topPageName ){
      browserHistory.push("/");
    }
    else{
      browserHistory.push("/app/"+page);
    }
//    this.setState({page: page});
  }

  onBackKeyDown(){
    if( this.state.drawerOpen ){
      this.toggleDrawerOpen();
    }
    else{
      this.handlePageSelection(topPageName);
    }
  }

  toggleDrawerOpen(){
    this.setDrawerOpen(!this.state.drawerOpen);
  }

  setDrawerOpen(open){
    this.setState({drawerOpen: open});
  }

  componentDidMount(){
    hideSplashScreen();

    initAfterComponentMounted();

    if( Meteor.isCordova ){
      document.addEventListener("backbutton", this.onBackKeyDown);
    }
    console.log("WeatherPage.componentDidMount()");
    WeatherForecasts.start();
    WeatherForecasts.onForecastUpdate(refreshWeatherChart);
  }

  componentWillUnmount(){
    console.log("WeatherPage.componentWillUmount()");
    WeatherForecasts.stop();
  }

  render(){
    const page = this.state.page;
    const pageConfig = Config.pages[page];
    const t = this.props.t;

    return (
      <div className="app">
        <AppBar
//          title={t(pageConfig.title)}
          title={getTitle(getPageName(this.props.location.pathname), t)}
          style={{"backgroundColor": "#F40000"}}
          titleStyle={{"fontSize": "18px"}}
          onLeftIconButtonTouchTap={()=>{this.toggleDrawerOpen()}}
          iconElementLeft={<IconButton><MenuIcon /></IconButton>}
        />
        <DrawerMenu
          drawerOpen={this.state.drawerOpen}
          onQuit={quitApp}
          onRequestChange={(open)=>{this.setDrawerOpen(open);}}
          onPageSelection={(page) => {this.handlePageSelection(page);}}
        />
        <AppChildWrapper
          drawerOpen={this.state.drawerOpen}>
          {this.props.children}
        </AppChildWrapper>
        <ConnectionStatusIndicatorContainer />
      </div>
    );
  }
}

// Weather charts such as the surface streamline analysis should have been updated
// before the weather forecast is updated. This function trigger refresh the charts in the cache.
function refreshWeatherChart(_forecast){
  [surfaceChartUrl, satelliteImageUrl].forEach((url)=>{

    const handle = FileCache.get(url);
    if( handle ){
      handle.refresh();
    }
  });
}

function getTitle(pageName, t){
  const translateKey = "title." + pageName;
  const translated = t(translateKey);
  if( translated != translateKey ){
    return translated;
  }
  else{
    // The key does not exist in the i18n dictionary
    return toTitleCase(pageName);
  }
}

function getPageName(path){
  const pathComponents = path.substring(1).split("/");
  return (pathComponents.length > 1 ? pathComponents[1] : pathComponents[0]);
}

class AppChildWrapper extends React.Component {

  shouldComponentUpdate(nextProps, _nextState){
    // Suppress rendering if the drawer is open for better performance.
    if(nextProps.drawerOpen){
      return false;
    }
    return true;
  }

  render(){
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

AppChildWrapper.propTypes = {
  drawerOpen: React.PropTypes.bool,
  children: React.PropTypes.node
}

function hideSplashScreen(){
  if( Meteor.isCordova ){
    navigator.splashscreen.hide();
  }
}

AppClass.propTypes = {
  t: React.PropTypes.func,
  children: React.PropTypes.node,
  location: React.PropTypes.object // Set by React Router
}

export default translate(['common'])(AppClass);
