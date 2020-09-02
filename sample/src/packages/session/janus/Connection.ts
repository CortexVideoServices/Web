import Connection from '../abc/Connection';
import { ConnectionState } from '../types/Connection';

/// Janus implementation of the Connection interface
export default class extends Connection {
  private _state = ConnectionState.Closed;
  /// Gets connection state
  protected getConnectionState(): ConnectionState {
    return this._state;
  }

  /// Connects to the server
  async connect(): Promise<void> {
    throw new Error('Not yet implemented');
  }

  /// Closes and destructs object
  async close(): Promise<void> {
    throw new Error('Not yet implemented');
  }
}
