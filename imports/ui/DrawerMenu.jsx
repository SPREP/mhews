import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/client/componentHelper.js';

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

export default DrawerMenu;
