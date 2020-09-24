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
import switch_cam from './assets/switch_cam.svg';
import mute_cam from './assets/mute-cam.svg';
import muted_cam from './assets/muted-cam.svg';
import mute_mic from './assets/mute-mic.svg';
import muted_mic from './assets/muted-mic.svg';

interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

export default function ({ sessionId, serverUrl, sessionListener, publisherListener }: Props) {
  let audio_enabled = true;
  let video_enabled = true;
  return (
    <Session sessionId={sessionId || 'SAMPLE'} serverUrl={serverUrl} eventHandlers={sessionListener}>
      <Publisher participantName="Anonymous" eventHandlers={publisherListener}>
        <LocalStream>
          {({ stream, participantName, switchCamera, enableAudio, enableVideo }) => (
            <div className="streamBox">
              <p className="streamTitle">{participantName || 'Local'}</p>
              <div className="streamPanel">
                <img src={switch_cam} className="streamIcon" onClick={() => switchCamera()} alt="Switch camera" />
                <img
                  src={video_enabled ? mute_cam : muted_cam}
                  className="streamIcon"
                  onClick={() => {
                    video_enabled = !video_enabled;
                    enableVideo(video_enabled);
                  }}
                  alt="Switch camera"
                />
                <img
                  src={audio_enabled ? mute_mic : muted_mic}
                  className="streamIcon"
                  onClick={() => {
                    audio_enabled = !audio_enabled;
                    enableAudio(video_enabled);
                  }}
                  alt="Switch camera"
                />
              </div>
              <Video stream={stream} className="streamView" />
            </div>
          )}
        </LocalStream>
      </Publisher>
      <Incoming clone={true}>
        <Stream>
          {({ stream, participantName, enableAudio, enableVideo }) => (
            <div className="streamBox">
              <p className="streamTitle">{participantName || 'Remote'}</p>
              <Video stream={stream} className="streamView" />
            </div>
          )}
        </Stream>
      </Incoming>
    </Session>
  );
}
