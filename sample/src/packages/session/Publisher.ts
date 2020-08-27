import { Participant, ParticipantSettings } from './Participant';

/// Publisher settings interface
export interface PublisherSettings extends ParticipantSettings {
  /// Enable/disable audio track
  audio: boolean;
  /// Enable/disable video track
  video: boolean;
}

/// Publisher listener
export interface PublisherListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Appeared / Disappeared dialog for requesting access to local media devices (mic, camera)
  onAccessDialog?(display: boolean): void;
  /// Called when a participant's stream has been created
  onStreamCreated?(publisher: Participant): void;
  /// Called before a participant's stream is destroyed
  onStreamDestroy?(publisher: Participant): void;
}

/// Stream publisher interface
export interface Publisher extends Participant {
  /// Publisher settings
  readonly settings: PublisherSettings;
  /// Access to camera granted/denied
  readonly accessGranted: boolean;
  /// Switches camera
  switchCamera(): Promise<void>;
  /// Starts capturer
  startCapturer(): Promise<void>;
  /// Stop capturer
  stopCapturer(): Promise<void>;
  /// Adds publisher listener
  add(listener: PublisherListener): boolean;
  /// Removes publisher listener
  remove(listener: PublisherListener): boolean;
}
