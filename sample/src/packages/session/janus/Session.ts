import Session from '../abc/Session';
import Connection from './Connection';
import Publisher from '../abc/Publisher';
import JanusConnection from './Connection';
import { ConnectionListener, ConnectionState } from '../types/Connection';
import { SessionSettings } from '../types/Session';

/// Janus implementation on session
export default class extends Session {
  private _connection: JanusConnection;
  /// Connection to the Janus server
  get connection(): Connection {
    return this._connection;
  }

  constructor(settings: SessionSettings, listener?: ConnectionListener) {
    super(settings, listener);
    this._connection = new JanusConnection(settings);
  }

  /// Renews connection
  protected renewConnection(): void {
    if (this.connection.state !== ConnectionState.Closed)
      throw new Error('Previous connection is not close, but request renew');
  }

  /// Starts publishing
  protected async startPublishing(publisher: Publisher): Promise<void> {
    throw new Error('Not yet implemented');
  }

  /// Stops publishing
  protected async stopPublishing(publisher: Publisher): Promise<void> {
    throw new Error('Not yet implemented');
  }
}
