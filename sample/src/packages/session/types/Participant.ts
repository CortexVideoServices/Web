import { AudioConstraints, VideoConstraints } from './Constraints';

/// Participant interface
export interface Participant {
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

/// Returns random string
function randomString(size: number): string {
  var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array(size)
    .join()
    .split(',')
    .map(function () {
      return s.charAt(Math.floor(Math.random() * s.length));
    })
    .join('');
}

/// Makes participant ID
export function makeParticipantID() {
  return randomString(6);
}
