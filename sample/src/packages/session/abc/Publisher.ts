import Participant from './Participant';
import { PublisherListener, PublisherSettings } from '../types/Publisher';
import { AudioConstraints, VideoConstraints } from '../types/Constraints';

/// Local stream publisher
export default abstract class Publisher extends Participant {
  /// Publisher settings
  readonly settings: PublisherSettings;

  private _accessGranted: boolean = false;

  /// Access to camera granted/denied
  get accessGranted(): boolean {
    return this._accessGranted;
  }

  private _audio: AudioConstraints | boolean = new AudioConstraints();
  /// Enable/disable audio track or constrains
  get audio(): AudioConstraints | boolean {
    return this._audio;
  }
  set audio(value) {
    let renew = value !== this._audio;
    if (value === true) {
      if (this._audio === false) this._audio = new AudioConstraints();
      else renew = false;
    } else this._audio = value;
    if (renew) this.startCapturer().catch((reason) => this.emitError(reason));
  }

  private _video: VideoConstraints | boolean = new VideoConstraints();
  /// Enable/disable video track or constrains
  get video(): VideoConstraints | boolean {
    return this._video;
  }
  set video(value) {
    let renew = value !== this._video;
    if (value === true) {
      if (this._video === false) this._video = new VideoConstraints();
      else renew = false;
    } else this._video = value;
    if (renew) this.startCapturer().catch((reason) => this.emitError(reason));
  }

  /// List of camera devices [[id, label]]
  get cameraList(): Array<[string, string]> {
    return Array.from(this.cameraDevices.entries());
  }

  private micDevices = new Map<string, string>();
  private cameraDevices = new Map<string, string>();
  private listeners = new Set<PublisherListener>();

  constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings);
    this.settings = settings;
    if (listener) this.addListener(listener);
    this.audio = settings.audio instanceof AudioConstraints ? settings.audio : settings.audio ? this.audio : false;
    this.video = settings.video instanceof VideoConstraints ? settings.video : settings.video ? this.video : false;
  }

  /// Emits event `onError`
  protected emitError(reason: Error, andThrow: boolean = false) {
    this.listeners.forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Starts media stream capturer
  async startCapturer(): Promise<MediaStream | null> {
    await this.stopCapturer();
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
        this.streamCreated(stream);
      }
      return stream;
    } catch (result) {
      this.emitError(result, true);
    } finally {
      this.listeners.forEach((listener) => listener.onAccessDialog?.call(this, false));
    }
    return null;
  }

  /// Switches camera
  async switchCamera(deviceId?: string): Promise<MediaStream | null> {
    try {
      if (!deviceId && this.mediaStream && this.cameraDevices.size && this.mediaStream.getVideoTracks().length) {
        const currentDeviceId = this.mediaStream.getVideoTracks()[0].getCapabilities().deviceId;
        if (currentDeviceId) {
          const deviceIds = Array.from(this.cameraDevices.keys());
          let nextDeviceId = deviceIds[0];
          const currentDeviceIndex = deviceIds.indexOf(currentDeviceId);
          if (currentDeviceIndex + 1 < deviceIds.length) nextDeviceId = deviceIds[currentDeviceIndex + 1];
          if (nextDeviceId) deviceId = nextDeviceId;
        }
      }
      if (deviceId && this._video instanceof VideoConstraints) {
        this._video.deviceId = deviceId;
        await this.startCapturer();
      }
    } catch (error) {
      this.emitError(error);
    }
    return this.mediaStream;
  }

  /// Stops media stream capturer
  async stopCapturer(): Promise<void> {
    this.streamDestroy();
  }

  /// Close and destruct
  async destroy(): Promise<void> {
    await this.closePeer();
    this.listeners.forEach((listener) => listener.onDestroy?.call(this));
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

  // Stream created
  protected streamCreated(stream: MediaStream | null) {
    super.streamCreated(stream);
    if (this.mediaStream) this.listeners.forEach((listener) => listener.onStreamCreated?.call(this, this));
  }

  /// Stream state change to closing
  protected streamDestroy() {
    if (this.mediaStream) this.listeners.forEach((listener) => listener.onStreamCreated?.call(this, this));
    super.streamDestroy();
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
