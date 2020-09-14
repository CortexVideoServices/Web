import Publisher from './Publisher';
import Connection from './Connection';
import { Stream } from '../types/Participant';
import { SessionListener, SessionSettings } from '../types/Session';
import { ConnectionListener, ConnectionState } from '../types/Connection';

/// Session abstract base class
export default abstract class Session {
  /// Session settings
  readonly settings: SessionSettings;

  private _connection: Connection = this.createConnection();
  /// Session connection
  get connection(): Connection {
    return this._connection;
  }

  /// Active remote streams
  get remoteParticipants(): Array<Stream> {
    return Array.from(this.remoteParticipantsSet);
  }

  private publishersSet = new Set<Publisher>();

  // Starts publishing
  protected abstract async startPublishing(publisher: Publisher): Promise<void>;

  // Stops publishing
  protected abstract async stopPublishing(publisher: Publisher): Promise<void>;

  private remoteParticipantsSet = new Set<Stream>();

  // Emits event `StreamReceived`
  protected emitStreamReceived(stream: Stream) {
    if (!this.remoteParticipantsSet.has(stream)) {
      this.remoteParticipantsSet.add(stream);
      this.listeners.forEach((listener) => listener.onStreamReceived?.call(this, stream));
    }
  }

  // Emits event `StreamDropped`
  protected emitStreamDropped(stream: Stream) {
    if (this.remoteParticipantsSet.has(stream)) {
      this.remoteParticipantsSet.delete(stream);
      this.listeners.forEach((listener) => listener.onStreamDropped?.call(this, stream));
    }
  }

  // created connection
  protected abstract createConnection(): Connection;

  protected constructor(settings: SessionSettings, listener?: SessionListener) {
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  private connectionListener: ConnectionListener = {
    onConnected: () => this.onConnected(),
    onDisconnected: () => this.onDisconnected(),
    onError: (reason: Error) => this.onError(reason),
  };

  protected emitError(reason: Error, andThrow: boolean = false) {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Connects to the sessions server
  async connect(): Promise<void> {
    if (this.connection.state === ConnectionState.Closed) {
      try {
        this._connection = this.createConnection();
        this.connection.addListener(this.connectionListener);
        await this.connection.connect();
      } catch (reason) {
        this.emitError(reason, true);
      }
    }
  }

  /// Starts a publisher streaming to the session.
  async publish(publisher: Publisher): Promise<void> {
    if (!this.publishersSet.has(publisher)) {
      try {
        if (this.connection.state === ConnectionState.Connected) await this.startPublishing(publisher);
        this.publishersSet.add(publisher);
      } catch (reason) {
        this.emitError(reason, true);
      }
    }
  }

  /// Disconnects the publisher from the session.
  async unpublish(publisher: Publisher): Promise<void> {
    if (this.publishersSet.has(publisher)) {
      try {
        if (this.connection.state === ConnectionState.Connected) await this.stopPublishing(publisher);
      } catch (reason) {
        this.emitError(reason, true);
      } finally {
        this.publishersSet.delete(publisher);
      }
    }
  }

  /// Disconnects from the sessions server
  disconnect(): void {
    this.connection.close().catch((reason) => this.emitError(reason));
  }

  private listeners = new Set<SessionListener>();

  /// Adds session listener
  addListener(listener: SessionListener): SessionListener {
    this.listeners.add(listener);
    return listener;
  }

  /// Removes session listener
  removeListener(listener: SessionListener): void {
    this.listeners.delete(listener);
  }

  // Called when connected
  private onConnected() {
    for (let publisher of this.publishersSet) {
      this.startPublishing(publisher).catch((reason) => this.emitError(reason));
    }
  }

  // Called when disconnected
  private onDisconnected() {
    this.remoteParticipantsSet.forEach((stream) => this.emitStreamDropped(stream));
    this.remoteParticipantsSet.clear();
  }

  private onError(reason: Error) {
    this.listeners.forEach((listener) => listener.onConnectionError?.call(this, reason));
  }
}
