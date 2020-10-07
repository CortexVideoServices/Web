import * as React from 'react';
import { Session, Publisher, Incoming } from '@cvss/react';
import './styles.css';

export function Sample0({ sessionId, serverUrl }) {
  return (
    <Session sessionId={sessionId || 'SAMPLE0'} serverUrl={serverUrl}>
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}

export default Sample0;
