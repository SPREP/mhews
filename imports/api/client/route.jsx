import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import AppInitializerContainer from '../../ui/AppInitializer.jsx';
import AdminDashboardContainer from '../../ui/AdminDashboard.jsx';

export function initRouter(){

  render(
    <Router history={ browserHistory }>
      <Route path="/" component={AppInitializerContainer} />
      <Route path="/admin" component={AdminDashboardContainer} />
    </Router>,
    document.getElementById('render-target')
  );
}
