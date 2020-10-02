import { Quality } from './common';

/// Video constraints
export class VideoConstraints implements MediaTrackConstraints {
  /// Camera device ID
  deviceId: string;
  /// Frame rate
  readonly frameRate: object;
  /// Frame width
  readonly width: object;
  /// Frame height
  readonly height: object;
  /// Aspect ratio
  readonly aspectRatio: object;

  constructor(
    deviceId: string = 'default',
    readonly resolution: Quality = Quality.Medium,
    readonly fps: Quality = Quality.Medium,
    readonly wide: boolean = false
  ) {
    this.deviceId = deviceId;
    this.frameRate = { max: fps.valueOf() >= 0 ? (fps.valueOf() > 0 ? 30 : 15) : 7 };
    let width: number, height: number;
    if (wide) {
      width = resolution.valueOf() >= 0 ? (resolution.valueOf() > 0 ? 1280 : 720) : 352;
      height = resolution.valueOf() >= 0 ? (resolution.valueOf() > 0 ? 720 : 480) : 288;
    } else {
      width = resolution.valueOf() >= 0 ? (resolution.valueOf() > 0 ? 1280 : 640) : 320;
      height = resolution.valueOf() >= 0 ? (resolution.valueOf() > 0 ? 960 : 480) : 240;
    }
    this.width = { ideal: width, max: width };
    this.height = { ideal: height, max: height };
    this.aspectRatio = { exact: width / height };
  }
}

/// Audio constraints
export class AudioConstraints implements MediaTrackConstraints {
  /// Mic device ID
  readonly deviceId: string;

  constructor(deviceId: string = 'default') {
    this.deviceId = deviceId;
  }
}
