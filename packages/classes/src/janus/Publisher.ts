import Publisher, { PublisherListener, PublisherSettings } from '../Publisher';
import JanusConnection from './Connection';
import { ConnectionState } from '../Connection';
import { CVSError } from '../common';

/// Janus implementation of the Publisher
export class JanusPublisher extends Publisher {
  private handleId: number = 0;
  private publishing: boolean = false;
  private janusConnection: JanusConnection | null = null;

  public constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings, listener);
  }

  /// Starts publishing
  async startPublishing(janusConnection: JanusConnection, roomId: number): Promise<void> {
    if (janusConnection.state !== ConnectionState.Connected)
      throw new CVSError('Janus connection fail, cannot start publishing');
    this.janusConnection = janusConnection;
    this.handleId = await this.janusConnection.attache('janus.plugin.videoroom');
    while (!this.publishing) {
      try {
        await this.janusConnection.sendRequest({
          janus: 'message',
          handle_id: this.handleId,
          body: { request: 'join', ptype: 'publisher', room: roomId, display: this.name || 'Remote participant' },
        });
        this.publishing = true;
      } catch (reason) {
        if (reason && reason.code === 426) {
          await this.janusConnection.sendRequest({
            janus: 'message',
            handle_id: this.handleId,
            body: { request: 'create', room: roomId, is_private: true, publishers: 6 },
          });
        } else this.emitError(reason, true);
      }
    }
    const jsepLocal = await this.createOffer();
    const [, jsepRemote] = await this.janusConnection.sendRequest({
      janus: 'message',
      handle_id: this.handleId,
      body: { request: 'configure', audio: true, video: true, ...(this.name ? { display: this.name } : {}) },
      jsep: jsepLocal,
    });
    await this.applyRemoteDescription(jsepRemote);
    await this.peerConnected();
  }

  /// Stops publishing
  async stopPublishing(): Promise<void> {
    try {
      if (this.janusConnection && this.handleId > 0 && this.janusConnection.state === ConnectionState.Connected)
        await this.janusConnection.detach(this.handleId);
    } finally {
      this.handleId = 0;
      this.janusConnection = null;
      this.publishing = false;
    }
  }

  protected sendTrickleCandidate(candidate: any): void {
    if (this.janusConnection)
      this.janusConnection.sendMessage({ janus: 'trickle', handle_id: this.handleId, candidate }).catch(() => null);
  }

  protected sendTrickleCompleted(): void {
    if (this.janusConnection)
      this.janusConnection
        .sendMessage({ janus: 'trickle', handle_id: this.handleId, candidate: { completed: true } })
        .catch(() => null);
  }
}

export default JanusPublisher;
