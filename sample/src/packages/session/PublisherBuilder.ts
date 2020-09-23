import Session from './Session';
import JanusPublisher from './janus/Publisher';
import Publisher, { PublisherListener, PublisherSettings } from './Publisher';
import { AudioConstraints, VideoConstraints } from './Constraints';

/// Builder for local stream publisher
export default class PublisherBuilder implements PublisherSettings {
  /// Session ID
  sessionId: string;
  /// Participant name
  participantName?: string;
  /// RTC configuration
  rtcConfiguration: RTCConfiguration;
  /// Debug mode flag
  debug: boolean;
  /// Enable/disable audio track or constrains
  audio: boolean | AudioConstraints;
  /// Enable/disable video track or constrains
  video: boolean | VideoConstraints;

  constructor(
    private session: Session,
    participantName?: string,
    audio: boolean | AudioConstraints = true,
    video: boolean | VideoConstraints = true
  ) {
    this.sessionId = session.settings.sessionId;
    this.participantName = participantName;
    this.rtcConfiguration = session.settings.rtcConfiguration;
    this.debug = session.settings.debug;
    this.audio = audio;
    this.video = video;
  }

  /// Creates publisher
  build(listener?: PublisherListener, autoPublishing: boolean = false): Publisher {
    const result = new JanusPublisher(this, listener);
    if (autoPublishing) this.session.addPublisher(result);
    return result;
  }
}
