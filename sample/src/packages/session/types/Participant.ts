import { randomString } from '../utils';

/// Participant interface
export interface Stream {
  /// ID
  readonly id: string;
  /// Media stream
  readonly mediaStream: MediaStream | null;
  /// Participant name
  readonly name?: string;
}

/// Participant settings interface
export interface ParticipantSettings {
  /// Participant name
  readonly participantName?: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
  /// Debug mode flag
  readonly debug: boolean;
}

/// Makes participant ID
export function makeParticipantID() {
  return randomString(6);
}
