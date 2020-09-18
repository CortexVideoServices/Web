import Connection, { ConnectionListener, ConnectionSettings, ConnectionState, ConnectionError } from '../Connection';
import { Reject, Resolve, Data, JanusError, JSep, Message } from './common';

interface JanusConnectionListener extends ConnectionListener {
  onEventMessage?(message: Message): void;
}

/// Janus implementation of the Connection interface
export default class JanusConnection extends Connection {
  private _state = ConnectionState.Closed;
  private ws: WebSocket | null = null;
  private sessionId: number = 0;
  private resultWaiters = new Map<string, [Resolve, Reject, number]>();
  private transaction: number = 0;

  constructor(settings: ConnectionSettings, private listener?: JanusConnectionListener) {
    super(settings, listener);
  }

  /// Connects to the server
  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(this.settings.serverUrl, 'janus-protocol');
      this.ws.onmessage = (event) => this.onMessage(JSON.parse(event.data));
      this.ws.onclose = (event) => {
        if (!event.wasClean) this.emitError(new ConnectionError(event.reason));
        this.onDisconnect();
      };
      this._state = ConnectionState.Connecting;
      const ws = this.ws;
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = (reason) => {
          if (this.settings.debug) console.debug(reason);
          reject(new ConnectionError('WebSocket cannot connect'));
        };
      });
      this.ws.onerror = (reason) => {
        if (this.settings.debug) console.debug(reason);
        this.emitError(new ConnectionError('WebSocket error'));
      };
      const [data] = await this.sendRequest({ janus: 'create' });
      this.sessionId = data.id;
      this.onConnected();
    } catch (reason) {
      this.ws?.close();
      this.ws = null;
      this._state = ConnectionState.Closed;
      this.emitError(reason, true);
    }
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

  /// Sends request
  async sendRequest(request: Partial<Message>, timeout: number = 15): Promise<[Data, JSep | null]> {
    const transaction = await this.sendMessage(request);
    return await new Promise<[Data, JSep | null]>((resolve, reject) => {
      this.resultWaiters.set(transaction, [resolve, reject, Date.now() + timeout * 1000]);
    });
  }

  /// Attaches plugin
  async attache(pluginName: string): Promise<number> {
    try {
      const [data] = await this.sendRequest({ janus: 'attach', plugin: pluginName });
      return data.id;
    } catch (reason) {
      this.emitError(reason, true);
    }
    return 0;
  }

  /// Detaches plugin
  async detach(handleId: number): Promise<void> {
    try {
      if (this.state === ConnectionState.Connected) {
        await this.sendMessage({ janus: 'detach', handle_id: handleId });
      }
    } catch (reason) {
      this.emitError(reason, true);
    }
  }

  /// Closes and destructs object
  async close(): Promise<void> {
    if ([ConnectionState.Connecting, ConnectionState.Connected].indexOf(this._state) >= 0) {
      this._state = ConnectionState.Closing;
      this.ws?.close();
    }
  }

  // Returns connection state
  protected getState(): ConnectionState {
    return this._state;
  }

  // transaction number generator
  private get nextTransaction() {
    this.transaction += 1;
    return `t${this.transaction}`;
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
    this.emitConnected();
    this.keepAlive(57).catch((reason) => {
      this.emitError(reason);
      this.close().catch((reason) => this.emitError(reason));
    });
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
    if (message.janus === 'event') {
      this.listener?.onEventMessage?.call(this, message);
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
