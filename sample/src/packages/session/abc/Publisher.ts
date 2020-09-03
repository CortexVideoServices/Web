import Participant from './Participant';
import { PublisherListener, PublisherSettings } from '../types/Publisher';
import { AudioConstraints, VideoConstraints } from '../types/Constraints';
import { Stream } from '../types/Participant';

/// Local stream publisher
export default abstract class Publisher extends Participant {
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

  constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings.participantName);
    this.settings = settings;
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

  /// Emits `Error` event
  protected emitError(reason: Error): void {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
  }

  /// Emits `StreamCreated` event
  protected emitStreamCreated(stream: Stream): void {
    this.listeners.forEach((listener) => listener.onStreamCreated?.call(this, stream));
  }

  /// Emits `StreamDestroy` event
  protected emitStreamDestroy(stream: Stream): void {
    this.listeners.forEach((listener) => listener.onStreamDestroy?.call(this, stream));
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
