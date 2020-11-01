import Connection, { ConnectionSettings, ConnectionListener, ConnectionState } from './Connection';
import { Participant, ParticipantListener } from './Participant';
import Publisher from './Publisher';
import 'webrtc-adapter';

/// Session settings
export interface SessionSettings extends ConnectionSettings {
  /// Session ID
  readonly sessionId: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
}

/// Session listener
export interface SessionListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Called when the classes client connects to the classes server.
  onConnected?(): void;
  /// Called when a local participant's stream has started publishing.
  onPublishingStarted?(publisher: Publisher): void;
  /// Called when a local participant's stream has stopped publishing.
  onPublishingStopped?(publisher: Publisher): void;
  /// Called when a remote participant's stream has been received
  onStreamReceived?(remoteStream: Participant): void;
  /// Called when a remote participant's stream has been disappeared
  onStreamDropped?(remoteStream: Participant): void;
  /// Called when a connection error occurred
  onConnectionError?(reason: Error): void;
  /// Called when the classes client has disconnected from the classes server.
  onDisconnected?(): void;
}
/*
/// Session interface
export interface Session {
  /// Session settings
  readonly settings: SessionSettings;
  /// Session ID
  readonly id: string;
  /// Session connection
  readonly connection: Connection;
  /// Received streams from the remote participants.
  readonly remoteStreams: Array<Participant>;
  /// Connects to the sessions server
  connect(): Promise<void>;
  /// Add publisher to this classes
  addPublisher(publisher: Publisher): void;
  /// Remove publisher from this classes
  removePublisher(publisher: Publisher): void;
  /// Disconnects from the sessions server
  disconnect(): Promise<void>;
  /// Adds classes listener
  addListener(listener: SessionListener): SessionListener;
  /// Removes classes listener
  removeListener(listener: SessionListener): void;
}
*/
/// Session abstract base class
export abstract class Session {
  /// Session settings
  readonly settings: SessionSettings;

  /// Session ID
  get id(): string {
    return this.settings.sessionId;
  }

  private _connection: Connection = this.createConnection();
  /// Session connection
  get connection(): Connection {
    return this._connection;
  }

  private remoteStreamsSet = new Set<Participant>();
  /// Received streams from the remote participants.
  get remoteStreams(): Array<Participant> {
    return Array.from(this.remoteStreamsSet);
  }

  private publishersMap = new Map<Publisher, ParticipantListener>();
  private listeners = new Set<SessionListener>();

  /// Creates connection
  protected abstract createConnection(): Connection;
  /// Starts publishing
  protected abstract startPublishing(publisher: Publisher): Promise<void>;
  /// Stops publishing
  protected abstract stopPublishing(publisher: Publisher): Promise<void>;
  /// Closes all remote streams
  protected abstract closeAll(): Promise<void>;

  protected constructor(settings: SessionSettings, listener?: SessionListener) {
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  private connectionListener: ConnectionListener = {
    onConnected: () => {
      Array.from(this.listeners).forEach((listener) => listener.onConnected?.call(this));
      for (const publisher of this.publishersMap.keys()) {
        if (publisher.mediaStream) this.startPublishing(publisher).catch((reason) => this.emitError(reason));
      }
    },
    onDisconnected: () => {
      this.closeAll().finally(() => {
        Array.from(this.listeners).forEach((listener) => listener.onDisconnected?.call(this));
      });
    },
    onError: (reason: Error) =>
      Array.from(this.listeners).forEach((listener) => listener.onConnectionError?.call(this, reason)),
  };

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

  /// Add publisher to this classes
  addPublisher(publisher: Publisher): void {
    if (!this.publishersMap.has(publisher)) {
      const listener = publisher.addListener({
        onStreamCreated: () => this.startPublishing(publisher).catch((reason) => this.emitError(reason)),
        onStreamDestroy: () => this.stopPublishing(publisher).catch((reason) => this.emitError(reason)),
      });
      this.publishersMap.set(publisher, listener);
      if (this.connection.state === ConnectionState.Connected && publisher.mediaStream)
        this.startPublishing(publisher).catch((reason) => this.emitError(reason));
    }
  }

  /// Remove publisher from this classes
  removePublisher(publisher: Publisher): void {
    if (this.publishersMap.has(publisher)) {
      const listener = this.publishersMap.get(publisher);
      if (listener) publisher.removeListener(listener);
      this.publishersMap.delete(publisher);
      if (this.connection.state === ConnectionState.Connected && publisher.mediaStream)
        this.stopPublishing(publisher).catch((reason) => this.emitError(reason));
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

  /// Adds classes listener
  addListener(listener: SessionListener): SessionListener {
    this.listeners.add(listener);
    return listener;
  }

  /// Removes classes listener
  removeListener(listener: SessionListener): void {
    this.listeners.delete(listener);
  }

  /// Emits event `onError`
  protected emitError(reason: Error, andThrow: boolean = false): void {
    Array.from(this.listeners).forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Emits event `onPublishingStarted`
  protected emitPublishingStarted(publisher: Publisher) {
    Array.from(this.listeners).forEach((listener) => listener.onPublishingStarted?.call(this, publisher));
  }

  /// Emits event `onPublishingStopped`
  protected emitPublishingStopped(publisher: Publisher) {
    Array.from(this.listeners).forEach((listener) => listener.onPublishingStopped?.call(this, publisher));
  }

  // Emits event `StreamReceived`
  protected emitStreamReceived(participant: Participant) {
    if (!this.remoteStreamsSet.has(participant)) {
      this.remoteStreamsSet.add(participant);
      Array.from(this.listeners).forEach((listener) => listener.onStreamReceived?.call(this, participant));
    }
  }

  // Emits event `StreamDropped`
  protected emitStreamDropped(participant: Participant) {
    if (this.remoteStreamsSet.has(participant)) {
      this.remoteStreamsSet.delete(participant);
      Array.from(this.listeners).forEach((listener) => listener.onStreamDropped?.call(this, participant));
    }
  }
}

export default Session;
