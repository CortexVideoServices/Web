import Connection, { ConnectionSettings, ConnectionListener, ConnectionState } from './Connection';
import { Participant, ParticipantListener } from './Participant';
import Publisher from './Publisher';

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
  /// Called when the session client connects to the session server.
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
  /// Called when the session client has disconnected from the session server.
  onDisconnected?(): void;
}

/// Session abstract base class
export default abstract class AbcSession {
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

  protected constructor(settings: SessionSettings, listener?: SessionListener) {
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  private connectionListener: ConnectionListener = {
    onConnected: () => {
      this.listeners.forEach((listener) => listener.onConnected?.call(this));
      for (const publisher of this.publishersMap.keys()) {
        if (publisher.mediaStream) this.startPublishing(publisher).catch((reason) => this.emitError(reason));
      }
    },
    onDisconnected: () => {
      this.remoteStreamsSet.forEach((participant) => this.emitStreamDropped(participant));
      this.listeners.forEach((listener) => listener.onDisconnected?.call(this));
    },
    onError: (reason: Error) => this.listeners.forEach((listener) => listener.onConnectionError?.call(this, reason)),
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

  /// Add publisher to this session
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

  /// Remove publisher from this session
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

  /// Adds session listener
  addListener(listener: SessionListener): SessionListener {
    this.listeners.add(listener);
    return listener;
  }

  /// Removes session listener
  removeListener(listener: SessionListener): void {
    this.listeners.delete(listener);
  }

  /// Emits event `onError`
  protected emitError(reason: Error, andThrow: boolean = false): void {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Emits event `onPublishingStarted`
  protected emitPublishingStarted(publisher: Publisher) {
    this.listeners.forEach((listener) => listener.onPublishingStarted?.call(this, publisher));
  }

  /// Emits event `onPublishingStopped`
  protected emitPublishingStopped(publisher: Publisher) {
    this.listeners.forEach((listener) => listener.onPublishingStopped?.call(this, publisher));
  }

  // Emits event `StreamReceived`
  protected emitStreamReceived(participant: Participant) {
    if (!this.remoteStreamsSet.has(participant)) {
      this.remoteStreamsSet.add(participant);
      this.listeners.forEach((listener) => listener.onStreamReceived?.call(this, participant));
    }
  }

  // Emits event `StreamDropped`
  protected emitStreamDropped(participant: Participant) {
    if (this.remoteStreamsSet.has(participant)) {
      this.remoteStreamsSet.delete(participant);
      this.listeners.forEach((listener) => listener.onStreamDropped?.call(this, participant));
    }
  }
}
