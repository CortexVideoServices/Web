import JanusConnection from './Connection';
import { Data, JSep, Message } from './types';
import { ConnectionState } from '../types/Connection';

/// Implements janus plugin
export default class {
  private handleId: number = 0;
  constructor(private connection: JanusConnection, private pluginName: string) {}

  /// Attach participant plugin
  async attach(): Promise<number> {
    const [data] = await this.sendRequest({ janus: 'attach', plugin: this.pluginName });
    this.handleId = data.id;
    return this.handleId;
  }

  /// Detach participant plugin
  async detach(): Promise<void> {
    try {
      if (this.connection.state === ConnectionState.Connected) await this.sendMessage({ janus: 'detach' });
    } finally {
      this.handleId = 0;
    }
  }

  /// Sends message
  async sendMessage(message: Partial<Message>): Promise<string> {
    if (this.handleId) message.handle_id = this.handleId;
    return this.connection.sendMessage(message);
  }

  /// Sends request
  async sendRequest(request: Partial<Message>, timeout: number = 15): Promise<[Data, JSep | null]> {
    if (this.handleId) request.handle_id = this.handleId;
    return this.connection.sendRequest(request, timeout);
  }
}
