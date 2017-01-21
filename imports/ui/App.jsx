import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

/* i18n */
import { translate } from 'react-i18next';

import {initAfterComponentMounted} from '../startup/client/init.js';

/* Imports the mhews's components */
import SwitchableContent from './SwitchableContent.jsx';
import ConnectionStatusIndicatorContainer from './ConnectionStatusIndicator.jsx';
import DrawerMenu from './DrawerMenu.jsx';
import {quitApp} from '../api/client/appcontrol.js';
import {WeatherForecastObserver} from '../api/client/weatherForecastObserver.js';

/* global navigator */

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

  componentDidMount(){
    initAfterComponentMounted();

    if( Meteor.isCordova ){
      document.addEventListener("backbutton", this.onBackKeyDown);
    }
    console.log("WeatherPage.componentDidMount()");
    WeatherForecastObserver.start();

  }

  componentWillUnmount(){
    console.log("WeatherPage.componentWillUmount()");
    WeatherForecastObserver.stop();
  }

  render(){
    const t = this.props.t;
    const page = this.state.page;
    const pageConfig = Meteor.settings.public.pages[page];
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
        <DrawerMenu
          drawerOpen={this.state.drawerOpen}
          onQuit={quitApp}
          onRequestChange={(open)=>{this.setDrawerOpen(open);}}
          onPageSelection={(page) => {this.handlePageSelection(page);}}
        />
        <SwitchableContent
          page={page}
          drawerOpen={this.state.drawerOpen}
          onPageSelection={(page) => {
            this.handlePageSelection(page);
          }}
        />
        <ConnectionStatusIndicatorContainer />
      </div>
    );
  }
}

App.propTypes = {
  t: React.PropTypes.func
}

export default translate(['common'])(App);
