import React from 'react';
import ReactDOM from 'react-dom';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import {GridList, GridTile} from 'material-ui/GridList';
import List from 'material-ui/List/List';

import {WarningsMenuTile, WarningList} from './WarningList.jsx';
import {WeatherMenuTile, WeatherPage} from './Weather.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';
import AboutSMDPage from './AboutSMD.jsx';

const indexPage = 'IndexPage';
const weatherPage = 'Weather';
const earthquakePage = 'Earthquake';
const cyclonePage = 'Cyclone';
const aboutSMDPage = 'AboutSMD';
const warningListPage = 'Warnings';

const disasterNotificationTopic = 'disaster';

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
    onItemTouchTap={(event, child) => { event.preventDefault(); props.onClick(indexPage)}}
    >
    <MenuItem primaryText="Menu" />
    <MenuItem primaryText="Disaster Warning" />
    <MenuItem primaryText="Help" />
    <MenuItem primaryText="About" />
  </IconMenu>
);

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      page: indexPage
    }
    this.fcmdata = null;

    // Change the back-button behavior
    document.addEventListener("backbutton", () => { this.onBackKeyDown() });

    this.initfcm();
  }
  handlePageSelection(page){
    this.setState({page: page});
  }
  onBackKeyDown(){
    if( this.state.page == indexPage){
      navigator.app.exitApp();
    }
    else{
      this.handlePageSelection(indexPage);
    }
  }

  // Initialize the FCM plugin
  initfcm() {

    FCMPlugin.subscribeToTopic(disasterNotificationTopic);

    FCMPlugin.onNotification(
      (data) => {
        if(data.wasTapped){
          console.log("data received in the background!");
        }else{
          console.log("data received in the foreground!");
        }
        this.triggerPageChangeBasedOnFcmData(data);
      },
      (msg) => {
        console.log('onNotification callback successfully registered: ' + msg);
      },
      (err) => {
        console.error('Error registering onNotification callback: ' + err);
        // TODO Need to handle this error. Try to re-subscribe to the topic until it succeeds?
      }
    );
    console.log('After onNotification');
  }

  triggerPageChangeBasedOnFcmData(data){

    this.fcmdata = data;
    if( this.fcmdata.type == 'earthquake'){
      this.setState({page: 'Earthquake'});
    }
    else if( this.fcmdata.type == 'cyclone'){
      this.setState({page: 'Cyclone'});
    }
    else if( this.fcmdata.type == 'weather'){
      this.setState({page: 'Weather'});
    }
    else {
      console.error("Received unknown data type "+this.fcmdata.type);
    }
  }

  /**
  * Handle state change caused by the user choosing a menu.
  */
  renderContents(){
    if( this.state.page == indexPage ){
      return <IndexPage onClick={(page) => { this.handlePageSelection(page); }}/>
    }
    else if( this.state.page == weatherPage ){
      return <WeatherPage phenomena={this.fcmdata} />
    }
    else if( this.state.page == earthquakePage ){
      return <EarthquakePage phenomena={this.fcmdata} />
    }
    else if( this.state.page == cyclonePage ){
      return <CyclonePage phenomena={this.fcmdata} />
    }
    else if( this.state.page == aboutSMDPage ){
      return <AboutSMDPage />
    }
    else if( this.state.page == warningListPage ){
      return <WarningList />
    }
    else {
      console.error("Unknown page state:" + this.state.page);
      return <IndexPage onClick={(page) => { this.handlePageSelection(page); }}/>
    }
  }

  render(){

    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={this.state.page}
            iconElementLeft={<TopLeftMenu onClick={(page) => this.setState({page: page})}/>}
            />
          {this.renderContents()}
        </div>
      </MuiThemeProvider>

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
    overflowY: 'auto',
  },
};

const tilesData = [
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

class IndexPage extends React.Component {

  render(){
    return(
      <div>
        <List>
          <WeatherMenuTile onClick={() => this.props.onClick(weatherPage)} />
          <WarningsMenuTile onClick={() => this.props.onClick(warningListPage)} />
        </List>

        <GridList
          cellHeight={100}
          cols={2}
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

export default App;
