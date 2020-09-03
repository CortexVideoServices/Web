import * as React from 'react';
import { Publisher } from '@cvs/react';
import LocalStream from '@cvs/react/LocalStream';
import Session from '@cvs/react/Session';
import SessionBuilder from '@cvs/session/SessionBuilder';

let { protocol, hostname, port } = window.location;
protocol = protocol === 'http:' ? 'ws' : 'wss';
port = hostname === 'localhost' ? '8188' : port;
const serverUrl = `${protocol}://${hostname}:${port}/janus-ws`;
const sessionBuilder = new SessionBuilder(serverUrl, '01234AB');

export default function () {
  return (
    <Session
      sessionBuilder={sessionBuilder}
      eventHandlers={{
        onError: (reason: Error) => console.error('Session error received', reason),
      }}
    >
      <Publisher autoPublishing={true}>
        <LocalStream />
      </Publisher>
    </Session>
  );
}
