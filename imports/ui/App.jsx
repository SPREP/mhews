import React from 'react';
import ReactDOM from 'react-dom';

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

/* This plugin captures the tap event in React. This is slow and to be replaced in future.*/
import injectTapEventPlugin from 'react-tap-event-plugin';

/* i18n */
import { translate } from 'react-i18next';

/* Imports the mhews's components */
import {WarningList, WarningsMenuTile} from './WarningList.jsx';
import {WeatherPage, WeatherMenuTile} from './Weather.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';
import AboutSMDPage from './AboutSMD.jsx';

/* Key to lookup the next page. Also this strings are used as the key for translation */
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
    // FIXME props.onClick is not defined.
    onItemTouchTap={(event, child) => { event.preventDefault(); props.onClick(indexPage)}}
    >
    <MenuItem primaryText={props.t("menu.language")} />
    <MenuItem primaryText={props.t("menu.about")} />
  </IconMenu>
);

class App extends React.Component {
  constructor(props){
    super(props);
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
      this.setState({page: earthquakePage});
    }
    else if( this.fcmdata.type == 'cyclone'){
      this.setState({page: cyclonePage});
    }
    else if( this.fcmdata.type == 'weather'){
      this.setState({page: weatherPage});
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
      return <IndexPage {...this.props} onPageSelection={(page) => { this.handlePageSelection(page); }}/>
    }
    else if( this.state.page == weatherPage ){
      return <WeatherPage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == earthquakePage ){
      return <EarthquakePage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == cyclonePage ){
      return <CyclonePage {...this.props} phenomena={this.fcmdata} />
    }
    else if( this.state.page == aboutSMDPage ){
      return <AboutSMDPage {...this.props} />
    }
    else if( this.state.page == warningListPage ){
      return <WarningList {...this.props} />
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
            iconElementLeft={<TopLeftMenu {...this.props} />}
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
  title: 'title.eqtsunami',
  page: earthquakePage,
  contents: <EarthquakePage />
},
{
  img: 'images/cyclone_menu.jpg',
  title: 'title.cyclone',
  page: cyclonePage,
  contents: <CyclonePage />
},
{
  img: 'images/samet_icon.jpg',
  title: 'title.about',
  page: aboutSMDPage,
  contents: <AboutSMDPage />
},
];

class IndexPage extends React.Component {

  render(){
    const t = this.props.t;

    return(
      <div>
        <List>
          <WeatherMenuTile {...this.props} onTouchTap={() => this.props.onPageSelection(weatherPage)} />
          <WarningsMenuTile {...this.props} onTouchTap={() => this.props.onPageSelection(warningListPage)} />
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
              onTouchTap={() => this.props.onPageSelection(tile.page)}
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
