import { makeParticipantID, Participant } from '../types/Participant';
import { AudioConstraints, VideoConstraints } from '../types/Constraints';
import { PublisherListener, PublisherSettings } from '../types/Publisher';

/// Local stream publisher
export default class Publisher implements Participant {
  /// Participant ID
  readonly id: string = makeParticipantID();
  /// Participant name
  readonly name: string | null;

  private _mediaStream: MediaStream | null = null;

  /// Media stream
  get mediaStream(): MediaStream | null {
    return this._mediaStream;
  }

  /// Publisher settings
  readonly settings: PublisherSettings;

  private _accessGranted: boolean = false;

  /// Access to camera granted/denied
  get accessGranted(): boolean {
    return this._accessGranted;
  }

  /// Enable/disable audio track or constrains
  audio: boolean | AudioConstraints = new AudioConstraints();
  /// Enable/disable video track or constrains
  video: boolean | VideoConstraints = new VideoConstraints();

  /// List of camera devices [[id, label]]
  get cameraList(): Array<[string, string]> {
    return Array.from(this.cameraDevices.entries());
  }

  private micDevices = new Map<string, string>();
  private cameraDevices = new Map<string, string>();
  private listeners = new Set<PublisherListener>();
  private emitError = (reason: Error) => this.listeners.forEach((listener) => listener.onError?.call(this, reason));

  constructor(settings: PublisherSettings, listener?: PublisherListener) {
    this.settings = settings;
    this.name = settings.participantName || null;
    if (listener) this.addListener(listener);
    this.audio = settings.audio instanceof AudioConstraints ? settings.audio : settings.audio ? this.audio : false;
    this.video = settings.video instanceof VideoConstraints ? settings.video : settings.video ? this.video : false;
  }

  /// Starts media stream capturer
  async startCapturer(): Promise<MediaStream | null> {
    await this.close();
    if (!this.cameraDevices.size) await this.updateDeviceList();
    if (!this.audio && !this.video) return null;
    if (!this._accessGranted) this.listeners.forEach((listener) => listener.onAccessDialog?.call(this, true));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this.audio,
        video: this.video,
        peerIdentity: this.name || undefined,
      });
      if (stream !== null) {
        this._accessGranted = true;
        this.setStream(stream);
      }
      return stream;
    } finally {
      this.listeners.forEach((listener) => listener.onAccessDialog?.call(this, false));
    }
  }

  /// Switches camera
  async switchCamera(deviceId?: string): Promise<MediaStream | null> {
    throw new Error('Not yet implemented');
  }

  /// Stops media stream capturer
  async stopCapturer(): Promise<void> {
    this.closeStream();
  }

  /// Close and destruct
  async close(): Promise<void> {
    await this.stopCapturer();
    this.listeners.forEach((listener) => listener.onClosed?.call(this));
    this.listeners.clear();
  }

  /// Adds publisher listener
  addListener(listener: PublisherListener): PublisherListener {
    this.listeners.add(listener);
    return listener;
  }

  /// Removes publisher listener
  removeListener(listener: PublisherListener): void {
    this.listeners.delete(listener);
  }

  // Sets media stream
  private setStream(stream: MediaStream | null): void {
    this.closeStream();
    this._mediaStream = stream;
    this.listeners.forEach((listener) => listener.onStreamCreated?.call(this, this));
  }

  // Closes media stream
  private closeStream() {
    if (this._mediaStream) {
      this.listeners.forEach((listener) => listener.onStreamDestroy?.call(this, this));
      this._mediaStream?.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
    }
  }

  // Updates device list
  private async updateDeviceList() {
    return await new Promise<void>((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.micDevices.clear();
          this.cameraDevices.clear();
          devices.forEach((item) => {
            if (item.deviceId && item.deviceId !== 'default') {
              if (item.kind === 'videoinput') this.cameraDevices.set(item.deviceId, item.label);
              else if (item.kind === 'audioinput') this.micDevices.set(item.deviceId, item.label);
            }
          });
          resolve();
        })
        .catch(reject);
    });
  }
}
