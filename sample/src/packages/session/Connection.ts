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
  readonly debug: boolean;
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

/// Connection interface
export interface Connection {
  /// Connection state
  readonly state: ConnectionState;
  /// Connection settings
  readonly settings: ConnectionSettings;
  /// Connects to the server
  connect(): Promise<void>;
  /// Closes and destructs object
  close(): Promise<void>;
  /// Adds connection listener
  add(listener: ConnectionListener): boolean;
  /// Removes connection listener
  remove(listener: ConnectionListener): boolean;
}
