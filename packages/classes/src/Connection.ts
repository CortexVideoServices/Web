import { CVSError } from './common';

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
  /// Called when the classes client connects to the classes server.
  onConnected?(): void;
  /// Called when the classes client has disconnected from the classes server.
  onDisconnected?(): void;
}

/// Connection abstract base class
export abstract class AbcConnection {
  /// Connection settings
  readonly settings: ConnectionSettings;

  protected abstract getState(): ConnectionState;
  /// Connection state
  get state(): ConnectionState {
    return this.getState();
  }

  /// Connects to the server
  abstract connect(): Promise<void>;

  /// Closes and destructs object
  abstract close(): Promise<void>;

  protected constructor(settings: ConnectionSettings, listener?: ConnectionListener) {
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  private listeners = new Set<ConnectionListener>();

  /// Adds connection listener
  addListener(listener: ConnectionListener): ConnectionListener {
    this.listeners.add(listener);
    return listener;
  }

  /// Removes connection listener
  removeListener(listener: ConnectionListener): void {
    this.listeners.delete(listener);
  }

  /// Emits `onConnected` event
  protected emitConnected() {
    Array.from(this.listeners).forEach((listener) => listener.onConnected?.call(this));
  }

  /// Emits `onDisconnected` event
  protected emitDisconnected() {
    Array.from(this.listeners).forEach((listener) => listener.onDisconnected?.call(this));
  }

  /// Emits `onError` event
  protected emitError(reason: Error, andThrow: boolean = false) {
    Array.from(this.listeners).forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }
}

export default AbcConnection;
