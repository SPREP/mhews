import {FlowRouter} from 'meteor/kadira:flow-router';
import React from 'react';
import {mount} from 'react-mounter';

import TopPage from '../../ui/TopPage.jsx';
import AboutAppPage from '../../ui/AboutAppPage.jsx';
import UsagePage from '../../ui/UsagePage.jsx';
import PreferencesPage from '../../ui/PreferencesPage.jsx';
import WarningPage from '../../ui/WarningPage.jsx';
import EarthquakePage from '../../ui/EarthquakePage.jsx';
import CyclonePage from '../../ui/CyclonePage.jsx';
import App from '../../ui/App.jsx';
import AppTemplate from '../../ui/AppTemplate.jsx';
import ClimatePage from '../../ui/ClimatePage.jsx';
import WeatherPage from '../../ui/WeatherPage.jsx';
import AdminPage from '../../ui/admin/AdminPage.jsx';
import AdminDashboard from '../../ui/admin/AdminDashboard.jsx';
import WeatherDayIconMatrix from '../../ui/admin/WeatherDayIconMatrix.jsx';

function adminMount(component){
  const Layout = ({content})=>(
    <div>{content}</div>
  )
  mount(Layout, {
    content: (<div>admin</div>)
  });
}

function appMount(component){
  const Layout = ({content})=>(
    <AppTemplate><App>{content}</App></AppTemplate>
  )
  mount(Layout, {
    content: (component)
  })
}

function getParams(){
  return {id: FlowRouter.getParam("id")};
}

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
      appMount(<TopPage />)
    },
    name: 'app'
  })

  app.route('/about', {
    action(){
      appMount(<AboutAppPage />);
    },
    name: 'about'
  })

  app.route('/usage', {
    action(){
      appMount(<UsagePage />)
    },
    name: 'usage'
  })

  app.route('/settings', {
    action(){
      appMount(<PreferencesPage />)
    },
    name: 'settings'
  })

  app.route('/earthquake/:id', {
    action(){
      appMount(<EarthquakePage params={getParams()}/>)
    },
    name: 'earthquake'
  })

  app.route('/tsunami/:id', {
    action(){
      appMount(<EarthquakePage params={getParams()}/>)
    },
    name: 'tsunami'
  })

  app.route('/heavyRain/:id', {
    action(){
      appMount(<WarningPage params={getParams()}/>)
    },
    name: 'heavyRain'
  })

  app.route('/cyclone/:id', {
    action(){
      appMount(<CyclonePage params={getParams()}/>)
    },
    name: 'cyclone'
  })

  app.route('/:warning/:id', {
    action(){
      appMount(<WarningPage params={getParams()}/>)
    },
    name: 'warning'
  })

  app.route('/weather', {
    action(){
      appMount(<WeatherPage />)
    },
    name: 'weather'
  })

  app.route('/climate', {
    action(){
      appMount(<ClimatePage />)
    },
    name: 'climate'
  })

  const admin = FlowRouter.group({
    prefix: '/admin',
    name: 'admin'
  })

  admin.route('/', {
    action(){
      adminMount(<AdminDashboard />)
    },
    name: 'admin'
  })

  admin.route('/day-weather-matrix/:id', {
    action(){
      adminMount(<WeatherDayIconMatrix params={{id: FlowRouter.getParam("id")}}/>)
    },
    name: 'day-weather-matrix'
  })
}
