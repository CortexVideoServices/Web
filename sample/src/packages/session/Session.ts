import { Connection, ConnectionSettings } from './Connection';
import { Participant } from './Participant';
import { Publisher } from './Publisher';

/// SessionImpl settings
export interface SessionSettings extends ConnectionSettings {
  /// SessionImpl ID
  readonly sessionId: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
}

/// Session listener
export interface SessionListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Called when the session client connects to the session server.
  onConnected?(): void;
  /// Called when a connection error occurred
  onConnectionError?(reason: Error): void;
  /// Called when the session client has disconnected from the session server.
  onDisconnected?(): void;
  /// Called when a local participant's stream has started publishing
  onStartPublishing?(publisher: Participant): void;
  /// Called when a local participant's stream has stopped publishing
  onStopPublishing?(publisher: Participant): void;
  /// Called when a remote participant's stream has been received
  onStreamReceived?(remote: Participant): void;
  /// Called when a remote participant's stream has been disappeared
  onStreamDropped?(remote: Participant): void;
}

/// Session interface
export interface Session {
  /// Session settings
  readonly settings: SessionSettings;
  /// Session connection
  readonly connection: Connection;
  /// Active remote participants
  readonly remoteParticipants: Array<Participant>;
  /// Connects to the sessions server
  connect(): Promise<void>;
  /// Starts a publisher streaming to the session.
  publish(publisher: Publisher): Promise<void>;
  /// Disconnects the publisher from the session.
  unpublish(publisher: Publisher): Promise<void>;
  /// Disconnects from the sessions server
  disconnect(): Promise<void>;
  /// Adds session listener
  addListener(listener: SessionListener): boolean;
  /// Removes session listener
  removeListener(listener: SessionListener): void;
}
