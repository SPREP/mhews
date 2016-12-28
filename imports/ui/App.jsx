import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/componentHelper.js';
import { createContainer } from 'meteor/react-meteor-data';

/* global navigator */
/* global Reload */

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
      const icon = React.createElement(getReactComponentByName(page.icon));
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
          leftIcon={icon}
          primaryText={this.props.t(title)}
          value={pageName}
          />);
    });

    children.push(
      <MenuItem
        key="quit"
        onTouchTap={
          () =>{
            quitAppVar.set(true);
          }
        }
        leftIcon={<CloseIcon />}
        primaryText={this.props.t("title.quit")}
        value={"title.quit"}
      />
    );

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

const quitAppVar = new ReactiveVar(false);

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
      drawerOpen: false,
      dialogOpen: false
    }
    this.isSoftwareUpdateConfirmed = false;

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

  renderConnectionStatus(){
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

  renderSoftwareUpdateAvailability(){
    const t = this.props.t;

    if( !this.props.connected ){
      return "";
    }
    if( this.isSoftwareUpdateConfirmed ){
      return "";
    }

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={()=>{this.closeDialog()}}
      />,
      <FlatButton
        label="Quit"
        primary={true}
        onTouchTap={()=>{quitAppVar.set(true)}}
      />,
    ];

    return (
      <div>
        <Snackbar
          open={this.props.softwareUpdateAvailable}
          message={t("software-update-available")}
          bodyStyle={{"width": "100%"}}
          style={{"width": "100%"}}
          action="Update"
          autoHideDuration={5000}
          onRequestClose={()=>{this.closeSoftwareUpdateSnackbar()}}
          onActionTouchTap={()=>{this.askUserToRestartApp()}}
        />
        <Dialog
          title="Software update"
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={()=>{this.closeDialog()}}
          >
          For installing the software update, the Application will be quit.
          Please restart the application.
          </Dialog>
        </div>
    );
  }

  closeSoftwareUpdateSnackbar(){
    this.isSoftwareUpdateConfirmed = true;
  }

  askUserToRestartApp(){
    this.setState({dialogOpen: true});
  }

  closeDialog(){
    this.setState({dialogOpen: false});
  }

  render(){
    const t = this.props.t;
    const page = this.state.page;
    const pageConfig = getPageConfig(page);
    const title = pageConfig.title;

    return (
      <div>
        <AppBar
          title={t(title)}
          style={{"backgroundColor": "#F40000"}}
          titleStyle={{"fontSize": "18px"}}
          onLeftIconButtonTouchTap={()=>{this.toggleDrawerOpen()}}
          iconElementLeft={<IconButton><MenuIcon /></IconButton>}
        />
        {this.state.drawerOpen ? this.renderDrawerMenu() : ""}
        {!this.state.drawerOpen ? this.renderSwitchableContent(page): ""}
        {!this.props.connected ? this.renderConnectionStatus(): ""}
        {this.props.softwareUpdateAvailable ? this.renderSoftwareUpdateAvailability(): ""}
      </div>
    );
  }
}

App.propTypes = {
  handles: React.PropTypes.object,
  t: React.PropTypes.func,
  connected: React.PropTypes.bool,
  softwareUpdateAvailable: React.PropTypes.bool
}

const AppContainer = createContainer(({t})=>{

  const handles = {};
  // To receive the data from the weatherForecast collection
  handles.weatherForecast = Meteor.subscribe('weatherForecast');

  // To receive the data from the warnings collection
  handles.warnings = Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  handles.cycloneBulletin = Meteor.subscribe('cycloneBulletins');

  Tracker.autorun(()=>{
    if( quitAppVar.get() == true ){
      navigator.app.exitApp();
    }
  })

  return {
    handles,
    t,
    connected: Meteor.status().connected,
    softwareUpdateAvailable: Reload.isWaitingForResume()
  }
}, App);

export default translate(['common'])(AppContainer);
