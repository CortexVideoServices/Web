import * as React from 'react';
import { Session, Publisher, Incoming, LocalStream, RemoteStream } from '@cvss/react';
import { SessionListener, PublisherListener } from '@cvss/classes';
import './styles.css';

interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

export function Sample1({ sessionId, serverUrl }: Props) {
  return (
    <Session sessionId={sessionId || 'SAMPLE1'} serverUrl={serverUrl}>
      <Publisher width={320} className="streamView">
        <div className="streamBox">
          <div className="streamControl">
            <div>
              <span>Local stream</span>
            </div>
          </div>
          <LocalStream width={320} className="streamView" />
        </div>
      </Publisher>
      <Incoming width={320} className="streamView">
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
