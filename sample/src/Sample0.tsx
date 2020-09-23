import * as React from 'react';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import Incoming from '@cvs/react/Incoming';
import './styles.css';

export default function () {
  return (
    <Session sessionId="SAMPLE">
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}
