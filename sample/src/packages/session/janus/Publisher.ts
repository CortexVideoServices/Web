import Publisher from '../abc/Publisher';
import JanusConnection from './Connection';
import JanusPlugin from './Plugin';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';
import { JanusError } from './types';
import { PublisherListener, PublisherSettings } from '../types/Publisher';

/// Janus implementation of the Publisher
export default class extends Publisher {
  private privateId: number = 0;
  private roomId: number;
  private plugin?: JanusPlugin;

  constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings, listener);
    this.roomId = parseInt(settings.sessionId, 36);
  }

  /// Starts peer
  async startPeer(janusConnection: JanusConnection): Promise<void> {
    if (janusConnection.state !== ConnectionState.Connected)
      throw new CVSError('Janus connection fail, cannot start peer');
    this.plugin = new JanusPlugin(janusConnection, 'janus.plugin.videoroom');
    await this.plugin.attach();
    while (true) {
      try {
        const [data] = await this.plugin.sendRequest({
          janus: 'message',
          body: { request: 'join', ptype: 'publisher', room: this.roomId },
        });
        this.privateId = data.privateId;
        break;
      } catch (error) {
        if (error instanceof JanusError && error.code === 426) {
          await this.plugin.sendRequest({
            janus: 'message',
            body: { request: 'create', room: this.roomId, is_private: true },
          });
        }
      }
    }
    await super.startPeer(janusConnection);
    // ToDo: Start publishing
  }

  /// Stop peer
  async stopPeer(): Promise<void> {
    // ToDo: Stop publishing if has connection
    await super.stopPeer();
    await this.plugin?.detach();
    this.plugin = undefined;
  }
}
