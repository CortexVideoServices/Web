import Publisher from './Publisher';
import Connection from './Connection';
import { Participant } from '../types/Participant';
import { SessionListener, SessionSettings } from '../types/Session';
import { ConnectionListener, ConnectionState } from '../types/Connection';

/// Session abstract base class
export default abstract class Session {
  /// Session settings
  readonly settings: SessionSettings;
  /// Session connection
  abstract readonly connection: Connection;

  /// Active remote participants
  get remoteParticipants(): Array<Participant> {
    return Array.from(this.remoteParticipantsSet);
  }

  protected remoteParticipantsSet = new Set<Participant>();
  protected publishersSet = new Set<Publisher>();

  // Starts publishing
  protected abstract async startPublishing(publisher: Publisher): Promise<void>;

  // Stops publishing
  protected abstract async stopPublishing(publisher: Publisher): Promise<void>;

  // Renews connection
  protected abstract renewConnection(): void;

  constructor(settings: SessionSettings, listener?: SessionListener) {
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  private connectionListener: ConnectionListener = {
    onConnected: () => this.onConnected(),
    onDisconnected: () => this.onDisconnected(),
    onError: (reason: Error) => this.listeners.forEach((listener) => listener.onConnectionError?.call(this, reason)),
  };

  private emitError(reason: Error, andThrow: boolean = false) {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Connects to the sessions server
  async connect(): Promise<void> {
    if (this.connection.state === ConnectionState.Closed) {
      try {
        this.renewConnection();
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
  async disconnect(): Promise<void> {
    try {
      await this.connection.close();
    } catch (reason) {
      this.emitError(reason, true);
    }
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
      this.startPublishing(publisher).catch(this.emitError);
    }
  }

  // Called when disconnected
  private onDisconnected() {
    this.remoteParticipantsSet.clear();
  }
}
