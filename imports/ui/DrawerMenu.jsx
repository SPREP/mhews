import React from 'react';
import { Meteor } from 'meteor/meteor';

/* i18n */
import { translate } from 'react-i18next';

/* Imports from the material-ui */
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

// Icons
import HomeIcon from 'material-ui/svg-icons/action/home';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
//import WarningIcon from 'material-ui/svg-icons/alert/warning';
//import WeatherIcon from 'material-ui/svg-icons/image/wb-sunny';
import CopyrightIcon from 'material-ui/svg-icons/action/copyright';
import InfoOutlineIcon from 'material-ui/svg-icons/action/info-outline';
import LinkIcon from 'material-ui/svg-icons/content/link';

class DrawerMenu extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    console.log("DrawerMenu.render()");

    const menu = Meteor.settings.public.menu;
    const pages = {
      "topPage" : {
        "component": "TopPage",
        "title": "title.app",
        "icon": HomeIcon
      },
      "climate" : {
        "component": "ClimatePage",
        "title": "title.climate",
        "icon": LinkIcon
      },
      "usage" : {
        "component": "UsagePage",
        "title": "title.usage",
        "icon": InfoOutlineIcon
      },
      "about":{
        "component": "AboutAppPage",
        "title": "title.aboutApp",
        "icon": CopyrightIcon
      },
      "settings": {
        "component": "PreferencesPageContainer",
        "title": "title.settings",
        "icon": SettingsIcon
      }
    }

    const children = menu.map((pageName) => {
      const page = pages[pageName];
      const title = page.title;
      const icon = React.createElement(page.icon);
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

    if( this.props.onQuit ){
      children.push(
        <MenuItem
          key="quit"
          onTouchTap={this.props.onQuit}
          leftIcon={<CloseIcon />}
          primaryText={this.props.t("title.quit")}
          value={"title.quit"}
        />
      );
    }

    return (
      <Drawer
        docked={false}
        open={this.props.drawerOpen}
        onRequestChange={this.props.onRequestChange}>
        {children}
      </Drawer>)

  }
}

DrawerMenu.propTypes = {
  onRequestChange: React.PropTypes.func,
  onPageSelection: React.PropTypes.func,
  onQuit: React.PropTypes.func,
  drawerOpen: React.PropTypes.bool,
  t: React.PropTypes.func
}

export default translate(['common'])(DrawerMenu);
