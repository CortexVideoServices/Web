import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import Sample0 from './Sample0';
import Sample1 from './Sample1';
import Sample2 from './Sample2';

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/sample2">
        <Sample2 />
      </Route>
      <Route path="/sample1">
        <Sample1 />
      </Route>
      <Route path="/sample0">
        <Sample0 />
      </Route>
      <Route path="*">
        <App />
      </Route>
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);
