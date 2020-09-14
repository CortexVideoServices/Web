/// Janus implementation of the Publisher
import Publisher from '../abc/Publisher';
import JanusConnection from './Connection';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';
import { PublisherListener, PublisherSettings } from '../types/Publisher';
import JanusPlugin from './Plugin';
import { JanusError } from './types';

export default class extends Publisher {
  ///
  private roomId: number;
  private privateId: number = 0;
  private janusConnection: JanusConnection | null = null;
  private plugin = new JanusPlugin('janus.plugin.videoroom');

  constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings, listener);
    this.roomId = parseInt(settings.sessionId, 36);
  }

  /// Starts publishing
  async startPublishing(janusConnection: JanusConnection): Promise<void> {
    if (janusConnection.state !== ConnectionState.Connected)
      throw new CVSError('Janus connection fail, cannot start publishing');
    this.janusConnection = janusConnection;
    if (this.mediaStream) await this._startPublishing(this.janusConnection);
  }

  /// Stops publishing
  async stopPublishing(): Promise<void> {
    try {
      if (this.mediaStream) await this._stopPublishing();
    } finally {
      this.janusConnection = null;
    }
  }

  protected streamCreated(stream: MediaStream | null) {
    super.streamCreated(stream);
    if (this.janusConnection && !this.plugin.active) {
      this._startPublishing(this.janusConnection).catch((reason) => this.emitError(reason));
    }
  }

  protected streamDestroy() {
    if (this.janusConnection && this.plugin.active)
      this._stopPublishing()
        .catch((reason) => this.emitError(reason))
        .finally(() => super.streamDestroy());
  }

  protected sendTrickleCandidate(candidate: any): void {
    this.plugin.sendMessage({ janus: 'trickle', candidate }).catch(() => null);
  }

  protected sendTrickleCompleted(): void {
    this.plugin.sendMessage({ janus: 'trickle', candidate: { completed: true } }).catch(() => null);
  }

  async _startPublishing(janusConnection: JanusConnection) {
    await this.plugin.attach(janusConnection);
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
    const jsepLocal = await this.createOffer();
    const [, jsepRemote] = await this.plugin.sendRequest({
      janus: 'message',
      body: { request: 'configure', audio: true, video: true, ...(this.name ? { display: this.name } : {}) },
      jsep: jsepLocal,
    });
    await this.applyRemoteDescription(jsepRemote);
    await this.peerConnected();
  }

  async _stopPublishing() {
    // ToDo: send unpublish message
    await this.plugin.detach();
    await this.closePeer();
  }
}
