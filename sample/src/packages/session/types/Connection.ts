import { CVSError } from './types';

/// Package base error
export class ConnectionError extends CVSError {}

/// Connection state enumerator
export enum ConnectionState {
  Closed,
  Closing,
  Connecting,
  Connected,
}

/// Connection settings interface
export interface ConnectionSettings {
  /// URL for connection to the sessions server
  readonly serverUrl: string;
  /// Debug mode flag
  debug: boolean;
}

/// Connection listener
export interface ConnectionListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Called when the session client connects to the session server.
  onConnected?(): void;
  /// Called when the session client has disconnected from the session server.
  onDisconnected?(): void;
}
