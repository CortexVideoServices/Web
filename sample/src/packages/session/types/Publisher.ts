import { Participant, ParticipantSettings } from './Participant';

/// Publisher settings interface
export interface PublisherSettings extends ParticipantSettings {}

/// Publisher listener
export interface PublisherListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Appeared / Disappeared dialog for requesting access to local media devices (mic, camera)
  onAccessDialog?(display: boolean): void;
  /// Called when a participant's stream has been created
  onStreamCreated?(participant: Participant): void;
  /// Called before a participant's stream is destroyed
  onStreamDestroy?(participant: Participant): void;
  /// Called before a publisher is destroyed
  onClosed?(): void;
}
