import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SessionListener } from '@cvs/session/Session';
import { PublisherListener } from '@cvs/session/Publisher';
import Publisher from '@cvs/react/Publisher';
import Session from '@cvs/react/Session';
import IncomingStream from './packages/react/IncomingStream';

const sessionListener: SessionListener = {
  onStreamDropped: (participant) => console.info('@Session.onStreamDropped', participant),
  onStreamReceived: (participant) => console.info('@Session.onStreamReceived', participant),
  onPublishingStarted: (publisher) => console.info('@Session.onPublishingStarted', publisher),
  onPublishingStopped: (publisher) => console.info('@Session.onPublishingStopped', publisher),
  onConnected: () => console.info('@Session.onConnected'),
  onDisconnected: () => console.info('@Session.onDisconnected'),
  onConnectionError: (reason) => console.info('@Session.onConnectionError', reason),
  onError: (reason) => console.info('@Session.onError', reason),
};

const publisherListener: PublisherListener = {
  onError: (reason) => console.info('@Publisher.onError', reason),
  onAccessDialog: (display: boolean) => console.info('@Publisher.onAccessDialog', display),
  onStreamCreated: (participant) => console.info('@Publisher.onStreamCreated', participant),
  onStreamDestroy: (participant) => console.info('@Publisher.onStreamDestroy', participant),
};

export default function () {
  return (
    <div className="App">
      <Switch>
        <Route path="/start">
          <Session sessionId="TEST021" eventHandlers={sessionListener}>
            <Publisher width={320} className="streamView" eventHandlers={publisherListener} />
            <IncomingStream width={320} clone={true} className="streamView" />
          </Session>
        </Route>
        <Route path="*">
          <h1>Welcome!</h1>
        </Route>
      </Switch>
    </div>
  );
}
