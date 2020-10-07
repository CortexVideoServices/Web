import * as React from 'react';
import { Session, Publisher, Incoming, LocalStream, RemoteStream } from '@cvss/react';
import './styles.css';

export function Sample1({ sessionId, serverUrl }) {
  return (
    <Session sessionId={sessionId || 'SAMPLE1'} serverUrl={serverUrl}>
      <Publisher>
        <div className="streamBox">
          <div className="streamControl">
            <div>
              <span>Local stream</span>
            </div>
          </div>
          <LocalStream width={320} className="streamView" />
        </div>
      </Publisher>
      <Incoming>
        <div className="streamBox">
          <div className="streamControl">
            <div>
              <span>Remote stream</span>
            </div>
          </div>
          <RemoteStream width={320} className="streamView" />
        </div>
      </Incoming>
    </Session>
  );
}

export default Sample1;
