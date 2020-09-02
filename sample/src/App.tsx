import * as React from 'react';
import { Publisher } from '@cvs/react';
import LocalStream from '@cvs/react/LocalStream';
import Session from '@cvs/react/Session';
import SessionBuilder from '@cvs/session/SessionBuilder';

const sessionBuilder = new SessionBuilder('http://localhost', '01234AB');

export default function () {
  return (
    <Session sessionBuilder={sessionBuilder}>
      <Publisher autoPublishing={false}>
        <LocalStream />
      </Publisher>
    </Session>
  );
}
