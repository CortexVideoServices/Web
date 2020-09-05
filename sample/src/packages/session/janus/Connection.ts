import Connection from '../abc/Connection';
import { ConnectionError, ConnectionSettings, ConnectionState } from '../types/Connection';
import { Data, JanusError, JSep, Message, Reject, Resolve } from './types';

/// Janus implementation of the Connection interface
export default class extends Connection {
  private ws?: WebSocket;
  private _state = ConnectionState.Closed;
  /// Gets connection state
  protected getConnectionState(): ConnectionState {
    return this._state;
  }

  constructor(settings: ConnectionSettings, private onMessageListener?: (message: Message) => void) {
    super(settings);
  }

  private sessionId: number = 0;
  /// Connects to the server
  async connect(): Promise<void> {
    let ws: WebSocket | null = null;
    const error = new ConnectionError('WebSocket cannot connect');
    try {
      ws = new WebSocket(this.settings.serverUrl, 'janus-protocol');
      ws.onmessage = (event) => this.onMessage(JSON.parse(event.data));
      ws.onclose = (event) => {
        if (!event.wasClean) this.emitError(new ConnectionError(event.reason));
        this.onDisconnect();
      };
      this._state = ConnectionState.Connecting;
      await new Promise<void>((resolve, reject) => {
        if (ws) {
          ws.onopen = () => resolve();
          ws.onerror = (reason) => {
            if (this.settings.debug) console.debug(reason);
            reject(error);
          };
        } else reject(error);
      });
      ws.onerror = (reason) => {
        if (this.settings.debug) console.debug(reason);
        this.emitError(new ConnectionError('WebSocket error'));
      };
      this.ws = ws;
      const [data] = await this.sendRequest({ janus: 'create' });
      this.sessionId = data.id;
      this.onConnected();
    } catch (reason) {
      ws?.close();
      this.ws = undefined;
      this._state = ConnectionState.Closed;
      this.emitError(reason, true);
    }
  }

  private transaction: number = 0;
  private get nextTransaction() {
    this.transaction += 1;
    return `t${this.transaction}`;
  }

  /// Sends message
  async sendMessage(message: Partial<Message>): Promise<string> {
    if (this.ws && this._state !== ConnectionState.Closed) {
      message.transaction = this.nextTransaction;
      if (this.sessionId) message.session_id = this.sessionId;
      this.ws.send(JSON.stringify(message));
      return message.transaction;
    } else throw new ConnectionError('Tried to send message but connection absent');
  }

  private resultWaiters = new Map<string, [Resolve, Reject, number]>();

  /// Sends request
  async sendRequest(request: Partial<Message>, timeout: number = 15): Promise<[Data, JSep | null]> {
    const transaction = await this.sendMessage(request);
    return await new Promise<[Data, JSep | null]>((resolve, reject) => {
      this.resultWaiters.set(transaction, [resolve, reject, Date.now() + timeout * 1000]);
    });
  }

  /// Closes and destructs object
  async close(): Promise<void> {
    if (this._state in [ConnectionState.Connecting, ConnectionState.Connected]) {
      this._state = ConnectionState.Closing;
      this.ws?.close();
    }
  }

  private async keepAlive(timeout: number) {
    while (this._state === ConnectionState.Connected) {
      await this.sendMessage({ janus: 'keepalive' });
      const deadline = Date.now() + timeout * 1000;
      while (this._state === ConnectionState.Connected && deadline >= Date.now()) {
        await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        const now = Date.now();
        Array.from(this.resultWaiters.keys()).forEach((key) => {
          const item = this.resultWaiters.get(key);
          if (item) if (item[2] <= now) item[1](new ConnectionError('Connection timeout'));
        });
      }
    }
  }

  private onConnected() {
    this._state = ConnectionState.Connected;
    this.keepAlive(57).catch((reason) => {
      this.emitError(reason);
      this.close().catch((reason) => this.emitError(reason));
    });
    this.emitConnected();
  }

  private onMessage(message: Message) {
    let data: Data | null = null;
    let waiter = this.resultWaiters.get(message.transaction);
    if (waiter) {
      if (message.error) data = { error_code: message.error.code, error: message.error.reason };
      else if (message.plugindata && message.plugindata.data) data = message.plugindata.data;
      else if (message.data) data = message.data;
      if (data) {
        this.resultWaiters.delete(message.transaction);
        if (data.error) waiter[1](new JanusError(data.error_code, data.error));
        else waiter[0]([data, message.jsep || null]);
      }
    }
    if (['ack', 'webrtcup', 'media', 'success'].indexOf(message.janus) < 0) {
      this.onMessageListener?.call(this, message);
    }
  }

  private onDisconnect() {
    const error = new ConnectionError('Connection reset');
    this._state = ConnectionState.Closing;
    this.resultWaiters.forEach((waiter) => waiter[1](error));
    this._state = ConnectionState.Closed;
    this.emitDisconnected();
    this.resultWaiters.clear();
  }
}
