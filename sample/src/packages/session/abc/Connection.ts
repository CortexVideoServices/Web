import { ConnectionListener, ConnectionSettings, ConnectionState } from '../types/Connection';

/// Connection abstract base class
export default abstract class Connection {
  /// Connection state
  get state(): ConnectionState {
    return this.getConnectionState();
  }
  protected abstract getConnectionState(): ConnectionState;

  /// Connection settings
  readonly settings: ConnectionSettings;

  /// Connects to the server
  abstract connect(): Promise<void>;

  /// Closes and destructs object
  abstract close(): Promise<void>;

  constructor(settings: ConnectionSettings, listener?: ConnectionListener) {
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

  protected emitConnected = () => this.listeners.forEach((listener) => listener.onConnected?.call(this));
  protected emitDisconnected = () => this.listeners.forEach((listener) => listener.onDisconnected?.call(this));

  protected emitError(reason: Error, andThrow: boolean = false) {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }
}
