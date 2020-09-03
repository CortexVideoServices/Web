import Session from './abc/Session';
import Publisher from './janus/Publisher';
import { PublisherListener, PublisherSettings } from './types/Publisher';
import { AudioConstraints, VideoConstraints } from './types/Constraints';

/// Builder for local stream publisher
export default class PublisherBuilder implements PublisherSettings {
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
    this.participantName = participantName;
    this.rtcConfiguration = session.settings.rtcConfiguration;
    this.debug = session.settings.debug;
    this.audio = audio;
    this.video = video;
  }

  /// Creates publisher
  build(listener?: PublisherListener, autoPublishing: boolean = false): Publisher {
    const result = new Publisher(this, listener);
    if (autoPublishing) this.session.publish(result).catch(console.error);
    return result;
  }
}
