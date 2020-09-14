import * as React from 'react';
import SessionBuilder from '@cvs/session/SessionBuilder';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import LocalStream from '@cvs/react/LocalStream';
import Video from '@cvs/react/Video';
import Incoming from '@cvs/react/Incoming';
import Participants from '@cvs/react/Participants';
import Stream from '@cvs/react/Stream';

interface Props {
  sessionBuilder: SessionBuilder;
}

export default function ({ sessionBuilder }: Props) {
  return (
    <Session
      sessionBuilder={sessionBuilder}
      eventHandlers={{
        onError: (reason: Error) => console.error('Session error received', reason),
      }}
    >
      <Publisher>
        <LocalStream>
          {({ stream, switchCamera }) => (
            <Video width={320} className="streamView" stream={stream} onClick={() => switchCamera()} />
          )}
        </LocalStream>
      </Publisher>

      <Incoming>
        <Participants>
          {({ participants }) =>
            participants.map((participant) => (
              <Stream participant={participant}>
                {({ stream }) => <Video className="streamView" stream={stream} width={320} />}
              </Stream>
            ))
          }
        </Participants>
      </Incoming>
    </Session>
  );
}
