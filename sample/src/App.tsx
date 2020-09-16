import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import SessionBuilder from '@cvs/session/SessionBuilder';
import Sample0 from './Sample0';
import Sample1 from './Sample1';
import Sample2 from './Sample2';
import Sample3 from './Sample3';
import { SessionListener } from './packages/session/Session';
import Publisher from './packages/react/Publisher';
import Session from './packages/react/Session';

let { protocol, hostname, port } = window.location;
protocol = protocol === 'http:' ? 'ws' : 'wss';
port = hostname === 'localhost' ? '8188' : port;
const serverUrl = `${protocol}://${hostname}:${port}/janus-ws`;
const sessionBuilder = new SessionBuilder(serverUrl, 'TEST07');
const eventHandlers: SessionListener = {
  onStreamDropped: (participant) => console.info('@onStreamDropped', participant),
  onStreamReceived: (participant) => console.info('@onStreamReceived', participant),
  onPublishingStarted: (publisher) => console.info('@onPublishingStarted', publisher),
  onPublishingStopped: (publisher) => console.info('@onPublishingStopped', publisher),
  onConnected: () => console.info('@onConnected'),
  onDisconnected: () => console.info('@onDisconnected'),
  onConnectionError: (reason) => console.info('@onConnectionError', reason),
  onError: (reason) => console.info('@onError', reason),
};

export default function () {
  return (
    <div className="App">
      <Switch>
        <Route path="/sample3">
          <Sample3 sessionBuilder={sessionBuilder} eventHandlers={eventHandlers} />
        </Route>
        <Route path="/sample2">
          <Sample2 sessionBuilder={sessionBuilder} eventHandlers={eventHandlers} />
        </Route>
        <Route path="/sample1">
          <Sample1 sessionBuilder={sessionBuilder} eventHandlers={eventHandlers} />
        </Route>
        <Route path="/sample0">
          <Sample0 sessionBuilder={sessionBuilder} eventHandlers={eventHandlers} />
        </Route>
        <Route path="*">
          <Session sessionBuilder={sessionBuilder} eventHandlers={eventHandlers}>
            <Publisher width={320} className="streamView" />
          </Session>
        </Route>
      </Switch>
    </div>
  );
}
