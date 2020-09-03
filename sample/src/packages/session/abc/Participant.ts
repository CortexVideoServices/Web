import Connection from './Connection';
import { Stream } from '../types/Participant';
import { randomString } from '../utils';

/// Abstract base class of RTC participant
export default abstract class Participant implements Stream {
  /// Participant ID
  readonly id: string = Participant.makeId();
  /// Participant name
  readonly name: string | null;

  private _mediaStream: MediaStream | null = null;
  /// Media stream
  get mediaStream(): MediaStream | null {
    return this._mediaStream;
  }

  protected constructor(participantName?: string) {
    this.name = participantName || null;
  }

  /// Makes participant ID
  static makeId = () => randomString(6);

  /// Close and destruct
  abstract async close(): Promise<void>;

  protected abstract emitError(reason: Error): void;
  protected abstract emitStreamCreated(stream: Stream): void;
  protected abstract emitStreamDestroy(stream: Stream): void;

  /// Starts peer
  protected abstract async startPeer(signalConnection: Connection): Promise<void>;

  /// Stop peer
  protected abstract async stopPeer(signalConnection: Connection): Promise<void>;

  /// Sets media stream
  protected setStream(stream: MediaStream | null): void {
    this.closeStream();
    this._mediaStream = stream;
    this.emitStreamCreated(this);
  }

  /// Closes media stream
  protected closeStream() {
    if (this._mediaStream) {
      this.emitStreamDestroy(this);
      this._mediaStream?.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
    }
  }
}
