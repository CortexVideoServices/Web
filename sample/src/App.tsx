import * as React from 'react';
import { SessionListener } from '@cvs/session/Session';
import { PublisherListener } from '@cvs/session/Publisher';
import Session from '@cvs/react/Session';
import Sample2 from './Sample2';

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
      <Sample2 sessionId="TEST0021" sessionListener={sessionListener} publisherListener={publisherListener} />
    </div>
  );
}
