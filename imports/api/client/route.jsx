import React from 'react';
import { render } from 'react-dom';
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'
import IndexRedirect from 'react-router/lib/IndexRedirect'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'

import AdminDashboardContainer from '../../ui/AdminDashboard.jsx';
import TopPage from '../../ui/TopPage.jsx';
import AboutAppPage from '../../ui/AboutAppPage.jsx';
import UsagePage from '../../ui/UsagePage.jsx';
import PreferencesPage from '../../ui/PreferencesPage.jsx';
import EarthquakePage from '../../ui/Earthquake.jsx';
import HeavyRainPage from '../../ui/HeavyRain.jsx';
import CyclonePage from '../../ui/Cyclone.jsx';
import App from '../../ui/App.jsx';
import AppTemplate from '../../ui/AppTemplate.jsx';
import InitPage from '../../ui/InitPage.jsx';

export function initRouter(){

  render(
    <Router history={ browserHistory }>
      <Route path="/" component={AppTemplate}>
      <Route path="init" component={InitPage} />
      <Route path="app" component={App} >
        <Route path="about" component={AboutAppPage} />
        <Route path="usage" component={UsagePage} />
        <Route path="settings" component={PreferencesPage} />
        <Route path="earthquake/:id" component={EarthquakePage} />
        <Route path="tsunami/:id" component={EarthquakePage} />
        <Route path="heavyRain/:id" component={HeavyRainPage} />
        <Route path="cyclone/:id" component={CyclonePage} />
        <IndexRoute component={TopPage} />
      </Route>
      <IndexRedirect to="/app" />
    </Route>
  </Router>
  , document.getElementById('render-target'));
}

export function initRouterForBrowser(){

  render(
    <Router history={ browserHistory }>
      <Route path="/" component={AppTemplate}>
      <Route path="init" component={InitPage} />
      <Route path="app" component={App} >
        <Route path="about" component={AboutAppPage} />
        <Route path="usage" component={UsagePage} />
        <Route path="settings" component={PreferencesPage} />
        <Route path="earthquake/:id" component={EarthquakePage} />
        <Route path="heavyRain/:id" component={HeavyRainPage} />
        <Route path="cyclone/:id" component={CyclonePage} />
        <IndexRoute component={TopPage} />
      </Route>
      <Route path="/admin" component={AdminDashboardContainer}/>
      <IndexRedirect to="/app" />
    </Route>
  </Router>
  , document.getElementById('render-target'));
}
