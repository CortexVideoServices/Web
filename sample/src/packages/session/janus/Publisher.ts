import Publisher from '../abc/Publisher';
import Connection from '../abc/Connection';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';

/// Janus implementation of the Publisher
export default class extends Publisher {
  /// Starts peer
  async startPeer(signalConnection: Connection): Promise<void> {
    if (signalConnection.state !== ConnectionState.Connected)
      throw new CVSError('Signal connection fail, cannot start peer');
    throw new Error('Not yet implemented');
  }

  /// Stop peer
  async stopPeer(signalConnection: Connection): Promise<void> {
    throw new Error('Not yet implemented');
  }
}
