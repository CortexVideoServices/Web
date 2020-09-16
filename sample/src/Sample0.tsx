import * as React from 'react';
import SessionBuilder from '@cvs/session/SessionBuilder';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import Incoming from '@cvs/react/Incoming';
import { SessionListener } from './packages/session/Session';

interface Props {
  sessionBuilder: SessionBuilder;
  eventHandlers: SessionListener;
}

export default function ({ sessionBuilder, eventHandlers }: Props) {
  return (
    <Session sessionBuilder={sessionBuilder} eventHandlers={eventHandlers}>
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}
