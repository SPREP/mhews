import {FlowRouter} from 'meteor/kadira:flow-router';
import React from 'react';
import {mount} from 'react-mounter';

//import TopPage from '../../ui/TopPage.jsx';
import App from '../../ui/App.jsx';
import AppTemplate from '../../ui/AppTemplate.jsx';

const AdminLayout = ({content})=>{
  const AdminPage = modules['AdminPage'];
  return (
    <AppTemplate><AdminPage>{content}</AdminPage></AppTemplate>
  )
}

const AppLayout = ({content})=>(
  <AppTemplate><App>{content}</App></AppTemplate>
)

function getParams(){
  return {id: FlowRouter.getParam("id")};
}

const modules = {};

function dynloadAndAppMount(moduleName, importFunction, params){
  dynloadAndMount(moduleName, AppLayout, importFunction, params);
}

function dynloadAndAdminMount(moduleName, importFunction, params){
  if( !modules['AdminPage']){
    import("/imports/ui/admin/AdminPage.jsx").then(({default: m})=>{
      modules['AdminPage'] = m;
      dynloadAndMount(moduleName, AdminLayout, importFunction, params);
    })
  }
  else{
    dynloadAndMount(moduleName, AdminLayout, importFunction, params);
  }
}

function dynloadAndMount(moduleName, Layout, importFunction, params){
  if( modules[moduleName] ){
    const m = modules[moduleName];
    if( params ){
      mount(Layout, {content: React.createElement(m, params)});
    }
    else{
      mount(Layout, {content: React.createElement(m)});
    }
  }
  else{
    importFunction().then(({default: m})=>{
      modules[moduleName] = m;
      if( params ){
        mount(Layout, {content: React.createElement(m, params)});
      }
      else{
        mount(Layout, {content: React.createElement(m)});
      }
    })

  }

}

/*
  IMPORTANT

  The Meteor's dynamic import requires to receive the module path as statically analyzable string literal.
  It is not possible to use variable to pass it. (e.g. const m = '/imports/ui/TopPage.jsx'; import(m); does not work.)
  Please refer to https://github.com/meteor/meteor/issues/8744 for more information.
*/
export function initFlowRouter() {

  FlowRouter.route('/', {
    action(){
      FlowRouter.redirect('/app')
    },
    name: 'app'
  })

  const app = FlowRouter.group({
    prefix: '/app',
    name: 'app'
  })

  app.route('/', {
    action(){
      dynloadAndAppMount('TopPage', ()=>{ return import('/imports/ui/TopPage.jsx')});
    },
    name: 'app'
  })

  app.route('/about', {
    action(){
      dynloadAndAppMount('AboutAppPage', ()=>{ return import('/imports/ui/AboutAppPage.jsx')});
    },
    name: 'about'
  })

  app.route('/usage', {
    action(){
      dynloadAndAppMount('UsagePage', ()=>{ return import('/imports/ui/UsagePage.jsx')});
    },
    name: 'usage'
  })

  app.route('/settings', {
    action(){
      dynloadAndAppMount('PreferencesPage', ()=>{ return import('/imports/ui/PreferencesPage.jsx')});
    },
    name: 'settings'
  })

  app.route('/earthquake/:id', {
    action(){
      dynloadAndAppMount('EarthquakePage', ()=>{ return import('/imports/ui/EarthquakePage.jsx')}, {params: getParams()});
    },
    name: 'earthquake'
  })

  app.route('/tsunami/:id', {
    action(){
      dynloadAndAppMount('EarthquakePage', ()=>{ return import('/imports/ui/EarthquakePage.jsx')}, {params: getParams()});
    },
    name: 'tsunami'
  })

  app.route('/heavyRain/:id', {
    action(){
      dynloadAndAppMount('WarningPage', ()=>{ return import('/imports/ui/WarningPage.jsx')}, {params: getParams()});
    },
    name: 'heavyRain'
  })

  app.route('/cyclone/:id', {
    action(){
      dynloadAndAppMount('CyclonePage', ()=>{ return import('/imports/ui/CyclonePage.jsx')}, {params: getParams()});
    },
    name: 'cyclone'
  })

  app.route('/:warning/:id', {
    action(){
      dynloadAndAppMount('WarningPage', ()=>{ return import('/imports/ui/WarningPage.jsx')}, {params: getParams()});
    },
    name: 'warning'
  })

  app.route('/weather', {
    action(){
      dynloadAndAppMount('WeatherPage', ()=>{ return import('/imports/ui/WeatherPage.jsx')});
    },
    name: 'weather'
  })

  app.route('/climate', {
    action(){
      dynloadAndAppMount('ClimatePage', ()=>{ return import('/imports/ui/ClimatePage.jsx')});
    },
    name: 'climate'
  })

  const admin = FlowRouter.group({
    prefix: '/admin',
    name: 'admin'
  })

  admin.route('/', {
    action(){
      dynloadAndAdminMount('AdminDashboard', ()=>{ return import('/imports/ui/admin/AdminDashboard.jsx')});
    },
    name: 'admin'
  })

  admin.route('/day-weather-matrix/:id', {
    action(){
      dynloadAndAdminMount('WeatherDayIconMatrix', ()=>{ return import('/imports/ui/admin/WeatherDayIconMatrix.jsx')}, {params: {id: FlowRouter.getParam("id")}});
    },
    name: 'day-weather-matrix'
  })
}
