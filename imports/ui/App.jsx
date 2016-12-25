import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/componentHelper.js';
import { createContainer } from 'meteor/react-meteor-data';

/* global navigator */

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
    console.log("DrawMenu.render()");

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
    console.log("SwitchableContent.render()");

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

  renderDrawerMenu(){
    return (
      <DrawerMenu {...this.props}
        drawerOpen={this.state.drawerOpen}
        onRequestChange={(open)=>{this.setDrawerOpen(open);}}
        onPageSelection={(page) => {this.handlePageSelection(page);}}
      />
    );
  }

  renderSwitchableContent(page){
    return (
      <SwitchableContentContainer {...this.props}
        page={page}
        onPageSelection={(page, phenomena) => {
          if( phenomena ){
            phenomenaVar.set(phenomena);
          }
          this.handlePageSelection(page);
        }}
      />
    );

  }

  renderConnectionIndicator(){
    const t = this.props.t;

    return (
      <Snackbar
        open={!this.props.connected}
        message={t("waiting-for-network")}
        bodyStyle={{"width": "100%"}}
        style={{"width": "100%"}}
      />
    );
  }

  render(){
    console.log("App.render()");

    const t = this.props.t;
    const page = this.state.page;
    const pageConfig = getPageConfig(page);
    const title = pageConfig.title;

    return (
      <div>
        <AppBar
          title={t(title)}
          onLeftIconButtonTouchTap={()=>{this.toggleDrawerOpen()}}
          iconElementLeft={<IconButton><MenuIcon /></IconButton>}
        />
        {this.state.drawerOpen ? this.renderDrawerMenu() : ""}
        {this.state.drawerOpen ? "" : this.renderSwitchableContent(page)}
        {!this.props.connected ? this.renderConnectionIndicator(): ""}
      </div>
    );
  }
}

App.propTypes = {
  handles: React.PropTypes.object,
  t: React.PropTypes.func,
  connected: React.PropTypes.bool
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
    handles,
    t,
    connected: Meteor.status().connected
  }
}, App);

export default translate(['common'])(AppContainer);
