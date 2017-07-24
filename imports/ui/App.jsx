import React from 'react';
import { Meteor } from 'meteor/meteor';

/* i18n */
import { translate, I18nextProvider } from 'react-i18next';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

/* Imports the mhews's components */
import WeatherForecasts from '../api/client/weather.js';
import {Preferences} from '../api/client/preferences.js';

import ConnectionStatusIndicatorContainer from './components/ConnectionStatusIndicator.jsx';
import DrawerMenu from './components/DrawerMenu.jsx';
import {quitApp} from '../api/client/appcontrol.js';
import {toTitleCase} from '../api/strutils.js';

import Config from '../config.js';

import './css/App.css';

import {FlowRouter} from 'meteor/kadira:flow-router';

const topPageName = Config.topPage;

const surfaceChartUrl = Config.cacheFiles.surfaceChart;

const satelliteImageUrl = Config.cacheFiles.satelliteImage;

class AppClass extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Config.topPage,
      drawerOpen: false,
      dialogOpen: false,
      i18nReady: false
    }
    this.isSoftwareUpdateConfirmed = false;
    this.onBackKeyDown = this.onBackKeyDown.bind(this);
  }

  handlePageSelection(page){
    const path = page == topPageName ? "/" : "/app/"+page;
    FlowRouter.go(path);
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

    console.log("App.componentDidMount()");

    import("../api/i18n.js").then(({default: m})=>{
      i18n = m;
      i18n.init();
      Preferences.onChange("language", i18n.changeLanguage);
      this.setState({i18nReady: true});
    })

    import('../startup/client/init2.js').then(({initAfterComponentMounted})=>{
      initAfterComponentMounted();

      if( Meteor.isCordova ){
        document.addEventListener("backbutton", this.onBackKeyDown);
      }

      WeatherForecasts.start();
//      WeatherForecasts.onForecastUpdate(refreshWeatherChart);

    })
  }

  componentWillUnmount(){
    console.log("App.componentWillUmount()");
    WeatherForecasts.stop();
  }

  render(){
    return this.state.i18nReady ? this.renderAfterI18nReady() : this.renderBeforeI18nReady();
  }

  renderBeforeI18nReady(){
    const page = this.state.page;
    const pageConfig = Config.pages[page];

    return (
      <div className="app">
        <AppBar
          title={""}
          style={{"backgroundColor": "#F40000"}}
          titleStyle={{"fontSize": "18px"}}
          onLeftIconButtonTouchTap={()=>{this.toggleDrawerOpen()}}
          iconElementLeft={<IconButton><MenuIcon /></IconButton>}
        />
      </div>
    );
  }
  renderAfterI18nReady(){
    const page = this.state.page;
    const pageConfig = Config.pages[page];
    const t = this.props.t;

    return (
      <I18nextProvider i18n={ i18n.getInstance() }>
      <div className="app">
        <AppBar
          title={getTitle(this.getPathName(), t)}
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
    </I18nextProvider>
    );
  }
  getPathName(){
    if( this.props.location ){
      // Still using the React Router
      return getPageName(this.props.location.pathname);
    }
    else{
      // Using the Flow Router
      const routeName = FlowRouter.current().route.name;
      console.log("routeName = "+routeName);
      return routeName;
    }
  }
}

function cacheFiles(){

  import('../../api/client/filecache.js').then(({default: m})=>{
    FileCache = m; // global

    const cacheFiles = Config.cacheFiles;
    for(let key in cacheFiles ){
      const url = cacheFiles[key];
      FileCache.add(url);
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

AppClass.propTypes = {
  t: React.PropTypes.func,
  children: React.PropTypes.node,
  location: React.PropTypes.object // Set by React Router
}

export default translate(['common'])(AppClass);
