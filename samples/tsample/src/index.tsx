import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Sample0 from './Sample0';
import Sample1 from './Sample1';
import Sample2 from './Sample2';
import './styles.css';

const sessionID = 'Sample';

ReactDOM.render(
  <HashRouter>
    <div className="App">
      <Switch>
        <Route path="/sample0">
          <Sample0 sessionId={sessionID} />
        </Route>
        <Route path="/sample1">
          <Sample1 sessionId={sessionID} />
        </Route>
        <Route path="*">
          <Sample2 sessionId={sessionID} />
        </Route>
      </Switch>
    </div>
  </HashRouter>,
  document.getElementById('root')
);
