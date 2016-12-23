import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/componentHelper.js';
import InitPageContainer from './InitPage.jsx';
import {Preferences} from '../api/preferences.js';
import { createContainer } from 'meteor/react-meteor-data';

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

// Function commonly used by the App and SwitchableContent
function getPageConfig(page){
  const config = Meteor.settings.public.pages[page];
  config.key = page;
  return config;
}

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
            (event) => {
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

DrawerMenu.propTypes = {
  onRequestChange: React.PropTypes.func,
  onPageSelection: React.PropTypes.func,
  drawerOpen: React.PropTypes.bool,
  t: React.PropTypes.func
}

// phenomena is provided either by user selection on the warning list page,
// or by the FCM. In order to keep the React components separated from the FCM,
// ReactiveVar is used instead of the state in the App.
export const phenomenaVar = new ReactiveVar(null);

class SwitchableContent extends React.Component {

  /**
  * Handle state change caused by the user choosing a menu.
  */
  render(){
    const page = this.props.page;
    const pageConfig = getPageConfig(page);
    const props = this.props;

    if( pageConfig ){
      if( pageConfig.component ){
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

}

SwitchableContent.propTypes = {
  page: React.PropTypes.string,
  t: React.PropTypes.func,
  phenomena: React.PropTypes.object,
  onPageSelection: React.PropTypes.func
}

const SwitchableContentContainer = createContainer(({t, page, onPageSelection})=>{

  // phenomena property is used by the Earthquake and HeavyRain pages.
  // It is transparent to the SwitchableContent.
  return {
    page,
    t,
    phenomena: phenomenaVar.get(),
    onPageSelection
  }
}, SwitchableContent);

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Meteor.settings.public.topPage,
      drawerOpen: false
    }

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });
  }

  onBackKeyDown(){
    const topPageName = Meteor.settings.public.topPage;

    if( this.state.drawerOpen ){
      this.toggleDrawerOpen();
    }
    else if( this.state.page == topPageName){
      navigator.app.exitApp();
    }
    else{
      this.handlePageSelection(topPageName);
    }
  }

  handlePageSelection(page){
    this.setState({page: page});
  }

  toggleDrawerOpen(){
    this.setDrawerOpen(!this.state.drawerOpen);
  }

  setDrawerOpen(open){
    this.setState({drawerOpen: open});
  }

  render(){
    const t = this.props.t;
    const page = this.state.page;
    const pageConfig = getPageConfig(page);
    const title = pageConfig.title;

    if( this.props.appInitialized ){
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
            <SwitchableContentContainer {...this.props}
              page={page}
              onPageSelection={(page, phenomena) => {
                if( phenomena ){
                  phenomenaVar.set(phenomena);
                }
                this.handlePageSelection(page);
              }}
              />
          </div>
        </MuiThemeProvider>

      );
    }
    else{
      const topPage = Meteor.settings.public.topPage;

      return (
        <MuiThemeProvider>
          <InitPageContainer {...this.props} onFinished={()=>{
              console.log("InitPageContainer.onFinished()");
              Preferences.save("appInitialized", true);
              this.handlePageSelection(topPage)}
            }/>
        </MuiThemeProvider>

      );
    }

  }
}

App.propTypes = {
  appInitialized: React.PropTypes.bool,
  handles: React.PropTypes.object,
  t: React.PropTypes.func
}

const AppContainer = createContainer(({t})=>{

  const handles = {};
  // To receive the data from the weatherForecast collection
  handles.weatherForecast = Meteor.subscribe('weatherForecast');

  // To receive the data from the warnings collection
  handles.warnings = Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  handles.cycloneBulletin = Meteor.subscribe('cycloneBulletins');

  return {
    appInitialized: Preferences.load("appInitialized"),
    handles,
    t
  }
}, App);

export default translate(['common'])(AppContainer);
