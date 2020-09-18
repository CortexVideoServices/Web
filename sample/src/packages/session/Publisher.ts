import AbcParticipant, { Participant, ParticipantListener, ParticipantSettings } from './Participant';
import { AudioConstraints, VideoConstraints } from './Constraints';

/// Publisher settings interface
export interface PublisherSettings extends ParticipantSettings {
  /// Session ID
  readonly sessionId: string;
  /// Audio track constrains
  readonly audio: boolean | AudioConstraints;
  /// Video track constrains
  readonly video: boolean | VideoConstraints;
}

/// Publisher listener
export interface PublisherListener extends ParticipantListener {
  /// Appeared / Disappeared dialog for requesting access to local media devices (mic, camera)
  onAccessDialog?(display: boolean): void;
}

/// Publisher interface
export interface Publisher extends Participant {
  /// Publisher settings
  readonly settings: PublisherSettings;
  /// Audio track constrains
  readonly audio: boolean | AudioConstraints;
  /// Video track constrains
  readonly video: boolean | VideoConstraints;
  // Access to camera granted/denied
  readonly accessGranted: boolean;
  /// List of camera devices [[id, label]]
  readonly camList: Array<[string, string]>;
  /// List of mic devices [[id, label]]
  readonly micList: Array<[string, string]>;
  /// Starts media stream capturer
  startCapturer(video?: boolean | VideoConstraints, audio?: boolean | AudioConstraints): Promise<MediaStream | null>;
  /// Switches camera
  switchCamera(deviceId?: string | VideoConstraints): Promise<MediaStream | null>;
  /// Stops media stream capturer
  stopCapturer(): Promise<void>;
  /// Adds publisher listener
  addListener(listener: PublisherListener): PublisherListener;
  /// Removes publisher listener
  removeListener(listener: PublisherListener): void;
}

/// Abstract base class of local stream publisher
export default abstract class AbcPublisher extends AbcParticipant implements Publisher {
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

  private _video: VideoConstraints | boolean = new VideoConstraints();
  /// Enable/disable video track or constrains
  get video(): VideoConstraints | boolean {
    return this._video;
  }

  private camDevices = new Map<string, string>();
  /// List of camera devices [[id, label]]
  get camList(): Array<[string, string]> {
    return Array.from(this.camDevices.entries());
  }

  private micDevices = new Map<string, string>();
  /// List of microphone devices [[id, label]]
  get micList(): Array<[string, string]> {
    return Array.from(this.micDevices.entries());
  }

  private listeners = new Set<PublisherListener>();

  protected constructor(settings: PublisherSettings, listener?: PublisherListener) {
    super(settings);
    this.settings = settings;
    if (listener) this.addListener(listener);
  }

  /// Starts media stream capturer
  async startCapturer(
    video: boolean | VideoConstraints = true,
    audio: boolean | AudioConstraints = true
  ): Promise<MediaStream | null> {
    this.setAudio(typeof audio !== 'undefined' ? audio : this.settings.audio);
    this.setVideo(typeof video !== 'undefined' ? video : this.settings.video);
    await this.stopCapturer();
    if (!this.camDevices.size) await this.updateDeviceList();
    if (!this.audio && !this.video) return null;
    if (!this._accessGranted)
      Array.from(this.listeners).forEach((listener) => listener.onAccessDialog?.call(this, true));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this.audio,
        video: this.video,
        peerIdentity: this.name || undefined,
      });
      if (stream !== null) {
        this._accessGranted = true;
        await this.setLocalStream(stream);
      }
      return stream;
    } catch (result) {
      this.emitError(result, true);
    } finally {
      Array.from(this.listeners).forEach((listener) => listener.onAccessDialog?.call(this, false));
    }
    return null;
  }

  /// Switches camera
  async switchCamera(deviceId?: string | VideoConstraints): Promise<MediaStream | null> {
    try {
      if (deviceId instanceof VideoConstraints) {
        await this.startCapturer(deviceId);
      } else {
        if (!deviceId && this.mediaStream && this.camDevices.size && this.mediaStream.getVideoTracks().length) {
          const currentDeviceId = this.mediaStream.getVideoTracks()[0].getCapabilities().deviceId;
          if (currentDeviceId) {
            const deviceIds = Array.from(this.camDevices.keys());
            let nextDeviceId = deviceIds[0];
            const currentDeviceIndex = deviceIds.indexOf(currentDeviceId);
            if (currentDeviceIndex + 1 < deviceIds.length) nextDeviceId = deviceIds[currentDeviceIndex + 1];
            if (nextDeviceId) deviceId = nextDeviceId;
          }
        }
        if (deviceId) {
          if (this.video instanceof VideoConstraints)
            this.setVideo(new VideoConstraints(deviceId, this.video.resolution, this.video.fps, this.video.wide));
          else this.setVideo(new VideoConstraints(deviceId));
          await this.startCapturer();
        }
      }
    } catch (error) {
      this.emitError(error, true);
    }
    return this.mediaStream;
  }

  /// Stops media stream capturer
  async stopCapturer(): Promise<void> {
    await this.closeStream();
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

  /// Emits event `onError`
  protected emitError(reason: Error, andThrow: boolean = false): void {
    Array.from(this.listeners).forEach((listener) => listener.onError?.call(this, reason));
    if (andThrow) throw reason;
  }

  /// Emits event `onStreamCreated`
  protected emitStreamCreated(participant: Participant): void {
    Array.from(this.listeners).forEach((listener) => listener.onStreamCreated?.call(this, participant));
  }

  /// Emits event `onStreamDestroy`
  protected emitStreamDestroy(participant: Participant): void {
    Array.from(this.listeners).forEach((listener) => listener.onStreamDestroy?.call(this, participant));
  }

  private setAudio(value: boolean | AudioConstraints) {
    if (value === true) {
      if (this._audio === false) this._audio = new AudioConstraints();
    } else this._audio = value;
  }

  private setVideo(value: boolean | VideoConstraints) {
    if (value === true) {
      if (this._video === false) this._video = new VideoConstraints();
    } else this._video = value;
  }

  // Updates device list
  private async updateDeviceList() {
    return await new Promise<void>((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.micDevices.clear();
          this.camDevices.clear();
          devices.forEach((item) => {
            if (item.deviceId && item.deviceId !== 'default') {
              if (item.kind === 'videoinput') this.camDevices.set(item.deviceId, item.label);
              else if (item.kind === 'audioinput') this.micDevices.set(item.deviceId, item.label);
            }
          });
          resolve();
        })
        .catch(reject);
    });
  }
}
