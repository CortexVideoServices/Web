import { Stream, ParticipantSettings } from './Participant';
import { AudioConstraints, VideoConstraints } from './Constraints';

/// Publisher settings interface
export interface PublisherSettings extends ParticipantSettings {
  /// Session ID
  readonly sessionId: string;
  /// Enable/disable audio track or constrains
  readonly audio: boolean | AudioConstraints;
  /// Enable/disable video track or constrains
  readonly video: boolean | VideoConstraints;
}

/// Publisher listener
export interface PublisherListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Appeared / Disappeared dialog for requesting access to local media devices (mic, camera)
  onAccessDialog?(display: boolean): void;
  /// Called when a participant's stream has been created
  onStreamCreated?(stream: Stream): void;
  /// Called before a participant's stream is destroyed
  onStreamDestroy?(stream: Stream): void;
  /// Called before a publisher is destroyed
  onDestroy?(): void;
}
