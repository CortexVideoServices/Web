/// Participant interface
export interface Participant {
  /// ID
  readonly id: string;
  /// Media stream
  readonly stream?: MediaStream;
  /// Participant name
  readonly name?: string;
  /// Closes and destructs object
  close(): Promise<void>;
}

/// Participant settings interface
export interface ParticipantSettings {
  /// Participant name
  readonly participantName?: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
  /// Audio constraints
  readonly audio: boolean | MediaTrackConstraints;
  /// Video constraints
  readonly video: boolean | MediaTrackConstraints;
  /// Debug mode flag
  readonly debug: boolean;
}
