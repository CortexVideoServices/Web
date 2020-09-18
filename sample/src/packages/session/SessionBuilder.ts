import JanusSession from './janus/Session';
import { Session, SessionListener, SessionSettings } from './Session';

/// Builder for session object
export default class SessionBuilder implements SessionSettings {
  /// URL for connection to the sessions server
  serverUrl: string;
  /// SessionImpl ID
  sessionId: string;
  /// RTC configuration
  rtcConfiguration: RTCConfiguration;
  /// Debug mode flag
  debug: boolean = false;

  constructor(serverUrl: string, sessionId: string) {
    this.serverUrl = serverUrl;
    this.sessionId = sessionId;
    this.rtcConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    };
  }

  /// Creates session
  build(listener?: SessionListener, makeProxy: boolean = false): Session {
    const session = new JanusSession(this, listener);
    if (makeProxy)
      return {
        id: session.id,
        settings: session.settings,
        get connection() {
          return session.connection;
        },
        get remoteStreams() {
          return session.remoteStreams;
        },
        connect: () => session.connect(),
        addPublisher: (publisher) => session.addPublisher(publisher),
        removePublisher: (publisher) => session.removePublisher(publisher),
        disconnect: () => session.disconnect(),
        addListener: (listener: SessionListener) => session.addListener(listener),
        removeListener: (listener) => session.removeListener(listener),
      };
    else return session;
  }
}
