import React from 'react';
import { render } from 'react-dom';
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'
import IndexRedirect from 'react-router/lib/IndexRedirect'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'

import TopPage from '../../ui/TopPage.jsx';
import AboutAppPage from '../../ui/AboutAppPage.jsx';
import UsagePage from '../../ui/UsagePage.jsx';
import PreferencesPage from '../../ui/PreferencesPage.jsx';
import WarningPage from '../../ui/WarningPage.jsx';
import EarthquakePage from '../../ui/Earthquake.jsx';
import CyclonePage from '../../ui/Cyclone.jsx';
import App from '../../ui/App.jsx';
import AppTemplate from '../../ui/AppTemplate.jsx';
import InitPage from '../../ui/InitPage.jsx';
import ClimatePage from '../../ui/ClimatePage.jsx';
import AdminPage from '../../ui/admin/AdminPage.jsx';
import AdminDashboard from '../../ui/admin/AdminDashboard.jsx';
import WeatherDayIconMatrix from '../../ui/admin/WeatherDayIconMatrix.jsx';

// Initialize the React Router that takes care of the display transition.
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
        <Route path="heavyRain/:id" component={WarningPage} />
        <Route path="cyclone/:id" component={CyclonePage} />
        <Route path="*/:id" component={WarningPage} />
        <Route path="climate" component={ClimatePage} />
        <IndexRoute component={TopPage} />
      </Route>
      <IndexRedirect to="/app" />
    </Route>
  </Router>
  , document.getElementById('render-target'));
}

// Initialize the React Router that takes care of the display transition.
export function initRouterWithAdminPage(){

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
        <Route path="heavyRain/:id" component={WarningPage} />
        <Route path="cyclone/:id" component={CyclonePage} />
        <Route path="*/:id" component={WarningPage} />
        <Route path="climate" component={ClimatePage} />
        <IndexRoute component={TopPage} />
      </Route>
      <Route path="/admin" component={AdminPage} >
        <Route path="day-weather-matrix/:id" component={WeatherDayIconMatrix}/>
        <IndexRoute component={AdminDashboard} />
      </Route>
      <IndexRedirect to="/app" />
    </Route>
  </Router>
  , document.getElementById('render-target'));
}
