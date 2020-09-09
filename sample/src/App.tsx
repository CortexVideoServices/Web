import * as React from 'react';
import Publisher from '@cvs/react/Publisher';
import Session from '@cvs/react/Session';
import SessionBuilder from '@cvs/session/SessionBuilder';
import LocalStream from './packages/react/LocalStream';
import Video from './packages/react/Video';

let { protocol, hostname, port } = window.location;
protocol = protocol === 'http:' ? 'ws' : 'wss';
port = hostname === 'localhost' ? '8188' : port;
const serverUrl = `${protocol}://${hostname}:${port}/janus-ws`;
const sessionBuilder = new SessionBuilder(serverUrl, 'TEST07');

export default function () {
  return (
    <Session
      sessionBuilder={sessionBuilder}
      eventHandlers={{
        onError: (reason: Error) => console.error('Session error received', reason),
      }}
    >
      <Publisher>
        <LocalStream>
          {({ stream, switchCamera }) => {
            return <Video width={320} stream={stream} onClick={() => switchCamera()} />;
          }}
        </LocalStream>
      </Publisher>
    </Session>
  );
}
