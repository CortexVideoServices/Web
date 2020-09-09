import Participant from '../abc/Participant';
import { SessionSettings } from '../types/Session';
import { FeedData } from './types';
import JanusConnection from './Connection';
import JanusPlugin from './Plugin';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';

/// Janus implementation of remote stream (participant)
export default class RemoteStream extends Participant {
  private roomId: number;
  private janusConnection: JanusConnection | null = null;
  private plugin = new JanusPlugin('janus.plugin.videoroom');

  public constructor(settings: SessionSettings, private privateId: number) {
    super({ debug: settings.debug, rtcConfiguration: settings.rtcConfiguration });
    this.roomId = parseInt(settings.sessionId, 36);
  }

  /// Starts subscribing
  async startSubscribing(janusConnection: JanusConnection, feed: FeedData): Promise<MediaStream | null> {
    if (janusConnection.state !== ConnectionState.Connected)
      throw new CVSError('Janus connection fail, cannot start publishing');
    await this.plugin.attach(janusConnection);
    const [, remoteJSep] = await this.plugin.sendRequest({
      janus: 'message',
      body: { request: 'join', ptype: 'subscriber', room: this.roomId, feed: feed.id, private_id: this.privateId },
    });
    await this.applyRemoteDescription(remoteJSep);
    const localJSep = await this.createAnswer();
    await this.plugin.sendRequest({ janus: 'message', body: { request: 'start', room: this.roomId }, jsep: localJSep });
    const result = await this.peerConnected();
    return result;
  }

  /// Stop subscribing
  async stopSubscribing(): Promise<void> {
    try {
      await this.plugin.detach();
      await this.closePeer();
    } finally {
      this.janusConnection = null;
    }
  }
}
