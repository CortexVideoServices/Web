import * as React from 'react';
import { Session, Publisher, Incoming, LocalStream, RemoteStream, Video } from '@cvss/react';
import { SessionListener, PublisherListener } from '@cvss/classes';
import switch_cam from './assets/switch_cam.svg';
import mute_cam from './assets/mute-cam.svg';
import muted_cam from './assets/muted-cam.svg';
import mute_mic from './assets/mute-mic.svg';
import muted_mic from './assets/muted-mic.svg';
import mute_spk from './assets/mute-spk.svg';
import muted_spk from './assets/muted-spk.svg';
import './styles.css';

interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

const sessionListener: SessionListener = {
  onStreamDropped: (participant) => console.info('@Session.onStreamDropped', participant),
  onStreamReceived: (participant) => console.info('@Session.onStreamReceived', participant),
  onPublishingStarted: (publisher) => console.info('@Session.onPublishingStarted', publisher),
  onPublishingStopped: (publisher) => console.info('@Session.onPublishingStopped', publisher),
  onConnected: () => console.info('@Session.onConnected'),
  onDisconnected: () => console.info('@Session.onDisconnected'),
  onConnectionError: (reason) => console.info('@Session.onConnectionError', reason),
  onError: (reason) => console.info('@Session.onError', reason),
};

const publisherListener: PublisherListener = {
  onError: (reason) => console.info('@Publisher.onError', reason),
  onAccessDialog: (display: boolean) => console.info('@Publisher.onAccessDialog', display),
  onStreamCreated: (participant) => console.info('@Publisher.onStreamCreated', participant),
  onStreamDestroy: (participant) => console.info('@Publisher.onStreamDestroy', participant),
};

export function Sample2({ sessionId, serverUrl }: Props) {
  return (
    <Session sessionId={sessionId || 'SAMPLE2'} serverUrl={serverUrl} eventHandlers={sessionListener}>
      <Publisher width={320} className="streamView" eventHandlers={publisherListener}>
        <LocalStream>
          {({ stream, participantName, switchCamera, enableAudio, enableVideo }) => {
            let audio = stream ? stream.getAudioTracks().length > 0 : false;
            let video = stream ? stream.getVideoTracks().length > 0 : false;
            return (
              <div className="streamBox">
                <div className="streamControl">
                  <div>
                    <span>{participantName || 'Local stream'}</span>
                    <div>
                      <img src={switch_cam} className="streamIcon" onClick={() => switchCamera()} alt="Switch camera" />
                      <img src={video ? mute_cam : muted_cam} onClick={() => enableVideo(!video)} alt="Video muter" />
                      <img src={audio ? mute_mic : muted_mic} onClick={() => enableAudio(!audio)} alt="Audio muter" />
                    </div>
                  </div>
                </div>
                <Video stream={stream} className="streamView" />
              </div>
            );
          }}
        </LocalStream>
      </Publisher>
      <Incoming clone={true}>
        <RemoteStream>
          {({ stream, participantName, muted, setMuted }) => (
            <div className="streamBox">
              <div className="streamControl">
                <div>
                  <span>{participantName || 'Remote stream'}</span>
                  <div>
                    <img src={muted ? muted_spk : mute_spk} onClick={() => setMuted(!muted)} alt="Audio muter" />
                  </div>
                </div>
              </div>
              <Video stream={stream} className="streamView" muted={muted} />
            </div>
          )}
        </RemoteStream>
      </Incoming>
    </Session>
  );
}

export default Sample2;
