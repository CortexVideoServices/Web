import { AudioConstraints, VideoConstraints } from './Constraints';
import { randomString } from '../utils';

/// Participant interface
export interface Stream {
  /// ID
  readonly id: string;
  /// Media stream
  readonly mediaStream: MediaStream | null;
  /// Participant name
  readonly name: string | null;
  /// Closes and destructs object
  close(): Promise<void>;
}

/// Participant settings interface
export interface ParticipantSettings {
  /// Participant name
  readonly participantName?: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
  /// Enable/disable audio track or constrains
  readonly audio: boolean | AudioConstraints;
  /// Enable/disable video track or constrains
  readonly video: boolean | VideoConstraints;
  /// Debug mode flag
  readonly debug: boolean;
}

/// Makes participant ID
export function makeParticipantID() {
  return randomString(6);
}
