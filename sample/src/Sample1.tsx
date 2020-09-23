import * as React from 'react';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import Incoming from '@cvs/react/Incoming';
import LocalStream from '@cvs/react/LocalStream';
import Stream from '@cvs/react/Stream';
import './styles.css';

export default function () {
  return (
    <Session sessionId="SAMPLE">
      <Publisher>
        <div className="streamBox">
          <p className="streamTitle">Local</p>
          <LocalStream width={320} className="streamView" />
        </div>
      </Publisher>
      <Incoming clone={true}>
        <div className="streamBox">
          <p className="streamTitle">Remote</p>
          <Stream width={320} className="streamView" />
        </div>
      </Incoming>
    </Session>
  );
}
