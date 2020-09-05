import { ParticipantSettings, Stream } from '../types/Participant';
import { randomString } from '../utils';
import { CVSError } from '../types/common';

/// Abstract base class of RTC participant
export default abstract class Participant implements Stream {
  /// Participant ID
  readonly id: string = randomString(6);

  /// Participant name
  get name() {
    return this._settings.participantName;
  }

  private _mediaStream: MediaStream | null = null;
  /// Media stream
  get mediaStream(): MediaStream | null {
    return this._mediaStream;
  }

  protected constructor(private _settings: ParticipantSettings) {}

  private _peerConnection: RTCPeerConnection | null = null;
  /// Peer connection
  protected get peerConnection(): RTCPeerConnection {
    if (this._peerConnection === null) this._peerConnection = this.createPeerConnection();
    return this._peerConnection;
  }

  /// Closes peer
  protected async closePeer() {
    this.streamDestroy();
    this._peerConnection?.close();
    this._peerConnection = null;
  }

  /// Stream created
  protected streamCreated(stream: MediaStream | null): void {
    this.streamDestroy();
    this._mediaStream = stream;
  }

  /// Stream state change to closing
  protected streamDestroy() {
    this._mediaStream?.getTracks().forEach((track) => track.stop());
    this._mediaStream = null;
  }

  protected sendTrickleCandidate(candidate: any): void {}
  protected sendTrickleCompleted(): void {}

  private peerConnectedResolver?: (value?: MediaStream | PromiseLike<MediaStream | null> | null | undefined) => void;
  private async peerConnected(): Promise<MediaStream | null> {
    return new Promise<MediaStream | null>((resolve, reject) => {
      this.peerConnectedResolver = resolve;
    });
  }

  private createPeerConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this._settings.rtcConfiguration);
    peerConnection.onicecandidate = (event) => {
      const candidate = JSON.parse(JSON.stringify(event.candidate));
      if (candidate) this.sendTrickleCandidate(candidate);
    };
    peerConnection.onicegatheringstatechange = () => {
      if (peerConnection.iceGatheringState === 'complete') this.sendTrickleCompleted();
    };
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === 'connected') {
        if (this.peerConnectedResolver) this.peerConnectedResolver(this.mediaStream);
      }
    };
    peerConnection.ontrack = (event) => {
      if (this._mediaStream === null) {
        this._mediaStream = new MediaStream();
      }
      this._mediaStream.addTrack(event.track);
    };
    return peerConnection;
  }

  /// Creates and returns offer
  protected async createOffer(stream?: MediaStream): Promise<any> {
    const mediaStream = stream || this.mediaStream;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => this.peerConnection.addTrack(track));
      this._mediaStream = mediaStream;
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return JSON.parse(JSON.stringify(offer));
    } else throw new CVSError('Local stream is not set');
  }

  /// Applies remote session description
  protected async applyRemoteDescription(data: any): Promise<void> {
    const remoteDesc = new RTCSessionDescription(data);
    await this.peerConnection.setRemoteDescription(remoteDesc);
    await this.peerConnected();
  }
}
