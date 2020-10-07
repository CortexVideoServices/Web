import * as React from 'react';
import { Session, Publisher, Incoming } from '@cvss/react';
import { SessionListener, PublisherListener } from '@cvss/classes';
import './styles.css';

interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

export function Sample0({ sessionId, serverUrl }: Props) {
  return (
    <Session sessionId={sessionId || 'SAMPLE0'} serverUrl={serverUrl}>
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}

export default Sample0;
