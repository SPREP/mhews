import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

import {GridList, GridTile} from 'material-ui/GridList';

import WeatherPage from './Weather.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';
import AboutSMDPage from './AboutSMD.jsx';

const topPage = 'TopPage';
const weatherPage = 'Weather';
const earthquakePage = 'Earthquake';
const cyclonePage = 'Cyclone';
const aboutSMDPage = 'AboutSMD';

const TopLeftMenu = (props) => (
  <IconMenu
    {...props}
    iconButtonElement={
      <IconButton><MenuIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    onItemTouchTap={(event, child) => { event.preventDefault(); props.onClick(topPage)}}
    >
    <MenuItem primaryText="Menu" />
    <MenuItem primaryText="Disaster Warning" />
    <MenuItem primaryText="Help" />
    <MenuItem primaryText="About" />
  </IconMenu>
);

class AppWithMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      page: topPage
    }
    this.event = null;

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });

    this.initfcm();
  }
  handlePageSelection(page){
    this.setState({page: page});
  }
  onBackKeyDown(){
    if( this.state.page == topPage){
      navigator.app.exitApp();
    }
    else{
      this.handlePageSelection(topPage);
    }
  }

  // Initialize the FCM plugin
  initfcm() {

    //FCMPlugin.subscribeToTopic( topic, successCallback(msg), errorCallback(err) );
    //All devices are subscribed automatically to 'all' and 'ios' or 'android' topic respectively.
    //Must match the following regular expression: "[a-zA-Z0-9-_.~%]{1,900}".
    FCMPlugin.subscribeToTopic('example');
    console.log('After subscribeToTopic');

    //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
    //Here you define your application behaviour based on the notification data.
    FCMPlugin.onNotification((data) => {
      if(data.wasTapped){
        //Notification was received on device tray and tapped by the user.
        console.log("data received in the background !!!!!!!!!!!!!!!!!!!!");
      }else{
        //Notification was received in foreground. Maybe the user needs to be notified.
        console.log("data received in the foreground !!!!!!!!!!!!!!!!!!!!");
      }
      console.log("data = "+data);
      console.log("data.data = "+data.data);
      console.log("data.type = "+data.type);
      this.event = data;
      this.setState({page: 'Earthquake'});
    },
    (msg) => {
      console.log('onNotification callback successfully registered: ' + msg);
    },
    (err) => {
      console.log('Error registering onNotification callback: ' + err);
    }
  );
    console.log('After onNotification');
  }

    /**
     * Handle state change caused by the user choosing a menu.
     */

  renderAfterMenuSelection(){
    if( this.state.page == topPage ){
      return <TopPage onClick={(page) => { this.handlePageSelection(page); }}/>
    }
    else if( this.state.page == weatherPage ){
      return <WeatherPage />
    }
    else if( this.state.page == earthquakePage ){
      if( this.event == null ){
        return <EarthquakePage />
      }
      else{
        console.log("<EarthquakePage disasterEvent="+this.event);
        return <EarthquakePage disasterEvent={this.event} />
      }
    }
    else if( this.state.page == cyclonePage ){
      return <CyclonePage />
    }
    else if( this.state.page == aboutSMDPage ){
      return <AboutSMDPage />
    }
  }

  render(){

    let contents;

    contents = this.renderAfterMenuSelection();

    if( contents == null ){
      console.error("Unknown page state:" + this.state.page);
    }

    return (
      <div>
        <AppBar
          title={this.state.page}
          iconElementLeft={<TopLeftMenu onClick={(page) => this.setState({page: page})}/>}
          />
        {contents}
      </div>

    );

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
    height: 450,
    overflowY: 'auto',
  },
};

const tilesData = [
  {
    img: 'images/weather_menu.jpg',
    title: 'Weather',
    page: 'Weather',
    contents: <WeatherPage />
  },
  {
    img: 'images/earthquake_menu.jpg',
    title: 'Earthquake and Tsunami',
    page: 'Earthquake',
    contents: <EarthquakePage />
  },
  {
    img: 'images/cyclone_menu.jpg',
    title: 'Cyclone',
    page: 'Cyclone',
    contents: <CyclonePage />
  },
  {
    img: 'images/samet_icon.jpg',
    title: 'About Samoa MET',
    page: 'AboutSMD',
    contents: <AboutSMDPage />
  },
];

class TopPage extends React.Component {

  render(){
    return(
      <div>
        <GridList
          cellHeight={180}
          cols={1}
          style={styles.gridList}
          >
          {tilesData.map((tile) => (
            <GridTile
              key={tile.title}
              title={tile.title}
              >
              <img src={tile.img} onClick={() => this.props.onClick(tile.page)}/>
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }
}

export default AppWithMenu;
