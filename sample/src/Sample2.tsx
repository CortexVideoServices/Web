import * as React from 'react';
import Session from '@cvs/react/Session';
import Publisher from '@cvs/react/Publisher';
import Incoming from '@cvs/react/Incoming';
import LocalStream from '@cvs/react/LocalStream';
import Stream from '@cvs/react/Stream';
import Video from '@cvs/react/Video';
import { SessionListener } from '@cvs/session/Session';
import { PublisherListener } from '@cvs/session/Publisher';
import './styles.css';
import switch_camera from './assets/switch_camera.svg';

interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

export default function ({ sessionId, serverUrl, sessionListener, publisherListener }: Props) {
  return (
    <Session sessionId={sessionId || 'SAMPLE'} serverUrl={serverUrl} eventHandlers={sessionListener}>
      <Publisher participantName="Anonymous" eventHandlers={publisherListener}>
        <LocalStream>
          {({ stream, participantName, switchCamera, enableAudio, enableVideo }) => (
            <div className="streamBox">
              <p className="streamTitle">
                {participantName}
                <img src={switch_camera} className="streamIcon" alt="Switch camera" />
              </p>
              <Video stream={stream} onClick={() => switchCamera()} width={320} className="streamView" />
            </div>
          )}
        </LocalStream>
      </Publisher>
      <Incoming clone={true}>
        <Stream>
          {({ stream, participantName, enableAudio, enableVideo }) => (
            <div className="streamBox">
              <p className="streamTitle">{participantName || 'Remote'}</p>
              <Video stream={stream} width={320} className="streamView" />
            </div>
          )}
        </Stream>
      </Incoming>
    </Session>
  );
}
