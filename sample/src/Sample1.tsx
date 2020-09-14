import * as React from 'react';
import SessionBuilder from '@cvs/session/SessionBuilder';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import Incoming from '@cvs/react/Incoming';
import Participants from '@cvs/react/Participants';

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
      <Publisher width={320} className="streamView" />

      <Incoming>
        <Participants width={320} className="streamView" />
      </Incoming>
    </Session>
  );
}
