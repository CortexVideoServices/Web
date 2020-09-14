import JanusConnection from './Connection';
import { Data, JSep, Message } from './types';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';

/// Implements janus plugin
export default class {
  private handleId: number = 0;
  private connection?: JanusConnection;
  constructor(private pluginName: string) {}

  /// True if plugin active
  get active(): boolean {
    return Boolean(this.connection);
  }

  /// Attach participant plugin
  async attach(connection: JanusConnection): Promise<number> {
    this.connection = connection;
    try {
      const [data] = await this.sendRequest({ janus: 'attach', plugin: this.pluginName });
      this.handleId = data.id;
    } catch (error) {
      this.connection = undefined;
      throw error;
    }
    return this.handleId;
  }

  /// Detach participant plugin
  async detach(): Promise<void> {
    const connection = this.connection;
    try {
      if (connection && connection.state === ConnectionState.Connected) await this.sendMessage({ janus: 'detach' });
    } finally {
      this.connection = undefined;
      this.handleId = 0;
    }
  }

  /// Sends message
  async sendMessage(message: Partial<Message>): Promise<string> {
    if (this.connection && this.connection.state === ConnectionState.Connected) {
      if (this.handleId) message.handle_id = this.handleId;
      return this.connection.sendMessage(message);
    } else throw new CVSError('Tried to send message but connection absent');
  }

  /// Sends request
  async sendRequest(request: Partial<Message>, timeout: number = 15): Promise<[Data, JSep | null]> {
    if (this.connection && this.connection.state === ConnectionState.Connected) {
      if (this.handleId) request.handle_id = this.handleId;
      return this.connection.sendRequest(request, timeout);
    } else throw new CVSError('Tried to send message but connection absent');
  }
}
