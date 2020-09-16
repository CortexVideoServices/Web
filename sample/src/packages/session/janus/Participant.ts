import Participant, { ParticipantListener, ParticipantSettings } from '../Participant';
import JanusConnection from './Connection';
import { ConnectionState } from '../Connection';
import { CVSError } from '../common';
import { FeedData } from './common';

/// Janus implementation of the remote participant
export default class JanusParticipant extends Participant {
  private handleId: number = 0;
  private janusConnection: JanusConnection | null = null;

  // constructor
  constructor(settings: ParticipantSettings, private listener?: ParticipantListener) {
    super(settings);
  }

  /// Starts subscribing
  async startSubscribing(
    janusConnection: JanusConnection,
    roomId: number,
    feed: FeedData,
    privateId: number
  ): Promise<void> {
    if (janusConnection.state !== ConnectionState.Connected)
      throw new CVSError('Janus connection fail, cannot start publishing');
    this.janusConnection = janusConnection;
    this.handleId = await this.janusConnection.attache('janus.plugin.videoroom');
    const [, remoteJSep] = await this.janusConnection.sendRequest({
      janus: 'message',
      handle_id: this.handleId,
      body: { request: 'join', ptype: 'subscriber', room: roomId, feed: feed.id, private_id: privateId },
    });
    await this.applyRemoteDescription(remoteJSep);
    const localJSep = await this.createAnswer();
    await this.janusConnection.sendRequest({
      janus: 'message',
      handle_id: this.handleId,
      body: { request: 'start', room: roomId },
      jsep: localJSep,
    });
    await this.peerConnected();
  }

  /// Stop subscribing
  async stopSubscribing(): Promise<void> {
    try {
      if (this.janusConnection && this.handleId > 0 && this.janusConnection.state === ConnectionState.Connected)
        await this.janusConnection.detach(this.handleId);
    } finally {
      this.handleId = 0;
      this.janusConnection = null;
    }
  }

  // Emits event `onError`
  protected emitError(reason: Error, andThrow: boolean): void {
    this.listener?.onError?.call(this, reason);
  }

  // Emits event `onStreamCreated`
  protected emitStreamCreated(participant: Participant): void {
    this.listener?.onStreamCreated?.call(this, participant);
  }

  // Emits event `onStreamDestroy`
  protected emitStreamDestroy(participant: Participant): void {
    this.listener?.onStreamDestroy?.call(this, participant);
  }
}
