import Session from './janus/Session';
import { SessionListener, SessionSettings } from './types/Session';

/// Builder for session object
export class SessionBuilder implements SessionSettings {
  /// URL for connection to the sessions server
  serverUrl: string;
  /// SessionImpl ID
  sessionId: string = '';
  /// RTC configuration
  rtcConfiguration: RTCConfiguration;
  /// Debug mode flag
  debug: boolean = false;

  constructor(serverUrl: string, sessionId: string) {
    this.serverUrl = serverUrl;
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
  build(sessionId: string, listener?: SessionListener): Session {
    this.sessionId = sessionId;
    return new Session(this, listener);
  }
}
