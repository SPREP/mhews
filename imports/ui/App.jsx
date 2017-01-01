import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
import { createContainer } from 'meteor/react-meteor-data';
import SwitchableContentContainer from './SwitchableContent.jsx';
import DrawerMenu from './DrawerMenu.jsx';
import {quitApp} from '../api/client/appcontrol.js';

/* global navigator */

// phenomena is provided either by user selection on the warning list page,
// or by the FCM. In order to keep the React components separated from the FCM,
// ReactiveVar is used instead of the state in the App.
export const phenomenaVar = new ReactiveVar(null);

const topPageName = Meteor.settings.public.topPage;

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      page: Meteor.settings.public.topPage,
      drawerOpen: false,
      dialogOpen: false
    }
    this.isSoftwareUpdateConfirmed = false;
    this.onBackKeyDown = this.onBackKeyDown.bind(this);
  }

  // FIXME What to be done here is to pause the app, not close it.
  onBackKeyDown(){
    if( this.state.drawerOpen ){
      this.toggleDrawerOpen();
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
        onQuit={quitApp}
        onRequestChange={(open)=>{this.setDrawerOpen(open);}}
        onPageSelection={(page) => {this.handlePageSelection(page);}}
      />
    );
  }

  renderSwitchableContent(page){
    return (
      <SwitchableContentContainer {...this.props}
        phenomenaVar={phenomenaVar}
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
        onTouchTap={quitApp}
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
    console.log("askUserToRestartApp()");
    this.setState({dialogOpen: true});
  }

  closeDialog(){
    this.setState({dialogOpen: false});
  }

  render(){
    const t = this.props.t;
    const page = this.state.page;
    const pageConfig = Meteor.settings.public.pages[page];
    const title = pageConfig.title;

    // Change the back-button behavior
    if( this.state.page != topPageName || this.state.drawerOpen ){
      document.addEventListener("backbutton", this.onBackKeyDown);
    }
    else{
      document.removeEventListener("backbutton", this.onBackKeyDown);
    }

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
  t: React.PropTypes.func,
  connected: React.PropTypes.bool,
  softwareUpdateAvailable: React.PropTypes.bool
}

const AppContainer = createContainer(({t})=>{

  return {
    t,
    connected: Meteor.status().connected,
    softwareUpdateAvailable: false
  }
}, App);

export default translate(['common'])(AppContainer);
