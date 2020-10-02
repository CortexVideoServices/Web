import { CVSError, randomString } from './common';
import { AudioConstraints, VideoConstraints } from './Constraints';

/// Participant interface
export interface Participant {
  /// Participant ID
  readonly id: string;
  /// Participant name
  readonly name?: string;
  /// Media stream
  readonly mediaStream: MediaStream | null;
  /// Audio track constrains
  readonly audio: boolean | AudioConstraints | MediaTrackConstraints;
  /// Video track constrains
  readonly video: boolean | VideoConstraints | MediaTrackConstraints;
}

/// Participant settings interface
export interface ParticipantSettings {
  /// Session ID
  readonly sessionId: string;
  /// Participant name
  readonly participantName?: string;
  /// RTC configuration
  readonly rtcConfiguration: RTCConfiguration;
  /// Debug mode flag
  readonly debug: boolean;
}

/// Participant listener
export interface ParticipantListener {
  /// Called when a error occurred
  onError?(reason: Error): void;
  /// Called when a participant's stream has been created
  onStreamCreated?(participant: Participant): void;
  /// Called before a participant's stream is destroyed
  onStreamDestroy?(participant: Participant): void;
}

const PARTICIPANT_ID_LENGTH = 7;

/// Abstract base class of RTC participant
export abstract class AbcParticipant implements Participant {
  /// Settings
  settings: ParticipantSettings;

  /// Participant ID
  readonly id: string = randomString(PARTICIPANT_ID_LENGTH);

  /// Participant name
  get name() {
    return this.settings.participantName;
  }

  private _mediaStream: MediaStream | null = null;
  /// Media stream
  get mediaStream(): MediaStream | null {
    return this._mediaStream;
  }

  /// Enable/disable audio track or constrains
  get audio(): boolean | AudioConstraints | MediaTrackConstraints {
    if (this._mediaStream instanceof MediaStream) {
      if (this._mediaStream.getAudioTracks().length > 0) {
        return this._mediaStream.getAudioTracks()[0].getConstraints();
      }
    }
    return false;
  }

  /// Enable/disable video track or constrains
  get video(): boolean | VideoConstraints | MediaTrackConstraints {
    if (this._mediaStream instanceof MediaStream) {
      if (this._mediaStream.getVideoTracks().length > 0) return this._mediaStream.getVideoTracks()[0].getConstraints();
    }
    return false;
  }

  /// Emits event `onError`
  protected abstract emitError(reason: Error, andThrow: boolean): void;
  /// Emits event `onStreamCreated`
  protected abstract emitStreamCreated(participant: Participant): void;
  /// Emits event `onStreamDestroy`
  protected abstract emitStreamDestroy(participant: Participant): void;

  /// Sends trickle candidate. Must implemented for a publisher.
  protected sendTrickleCandidate(_candidate: any): void {}
  /// Sends trickle candidate completed. Must implemented for a publisher.
  protected sendTrickleCompleted(): void {}

  /// Constrictor
  protected constructor(settings: ParticipantSettings) {
    this.settings = settings;
  }

  private _peerConnection: RTCPeerConnection | null = null;
  /// Peer connection
  protected get peerConnection(): RTCPeerConnection {
    if (this._peerConnection === null) this._peerConnection = this.createPeerConnection();
    return this._peerConnection;
  }

  /// Closes participant stream
  protected async closeStream() {
    if (this._mediaStream) {
      this.emitStreamDestroy(this);
      this._mediaStream.getTracks().forEach((track) => track.stop());
    }
    this._peerConnection?.close();
    this._peerConnection = null;
    this._mediaStream = null;
  }

  private peerConnectedResolver?: (value?: MediaStream | PromiseLike<MediaStream | null> | null | undefined) => void;
  /// This promise will be resolved after the peer connection is established.
  protected async peerConnected(): Promise<MediaStream | null> {
    return new Promise<MediaStream | null>((resolve) => {
      if (this._mediaStream) resolve(this._mediaStream);
      else this.peerConnectedResolver = resolve;
    });
  }

  private createPeerConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.settings.rtcConfiguration);
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
        // Set remote stream
        this._mediaStream = new MediaStream();
        this.emitStreamCreated(this);
      }
      this._mediaStream.addTrack(event.track);
    };
    return peerConnection;
  }

  /// Sets local stream
  protected async setLocalStream(stream: MediaStream): Promise<any> {
    if (this._mediaStream !== null) await this.closeStream();
    this._mediaStream = stream;
    this.emitStreamCreated(this);
  }

  /// Creates and returns offer
  protected async createOffer(stream?: MediaStream): Promise<any> {
    while (stream) {
      if (this._mediaStream && this._mediaStream.id === stream.id) break;
      await this.setLocalStream(stream);
      break;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => this.peerConnection.addTrack(track));
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return JSON.parse(JSON.stringify(offer));
    } else this.emitError(new CVSError('Local stream is not set'), true);
  }

  /// Applies remote classes description
  protected async applyRemoteDescription(data: any): Promise<void> {
    const remoteDesc = new RTCSessionDescription(data);
    await this.peerConnection.setRemoteDescription(remoteDesc);
  }

  /// Creates and returns answer
  protected async createAnswer(): Promise<any> {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return JSON.parse(JSON.stringify(answer));
  }
}

export default AbcParticipant;