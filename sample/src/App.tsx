import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import SessionBuilder from '@cvs/session/SessionBuilder';
import Sample0 from './Sample0';
import Sample1 from './Sample1';
import Sample2 from './Sample2';
import Sample3 from './Sample3';

let { protocol, hostname, port } = window.location;
protocol = protocol === 'http:' ? 'ws' : 'wss';
port = hostname === 'localhost' ? '8188' : port;
const serverUrl = `${protocol}://${hostname}:${port}/janus-ws`;
const sessionBuilder = new SessionBuilder(serverUrl, 'TEST07');

export default function () {
  return (
    <div className="App">
      <Switch>
        <Route path="/sample3">
          <Sample3 sessionBuilder={sessionBuilder} />
        </Route>
        <Route path="/sample2">
          <Sample2 sessionBuilder={sessionBuilder} />
        </Route>
        <Route path="/sample1">
          <Sample1 sessionBuilder={sessionBuilder} />
        </Route>
        <Route path="*">
          <Sample0 sessionBuilder={sessionBuilder} />
        </Route>
      </Switch>
    </div>
  );
}
