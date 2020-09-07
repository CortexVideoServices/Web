import { CVSError } from '../types/common';

export type Reject = (reason?: any) => void;
export type Resolve = (value?: [Data, JSep | null] | PromiseLike<[Data, JSep | null]> | undefined) => void;

/// Janus error
export class JanusError extends CVSError {
  readonly code: number;
  constructor(code: number, reason: string) {
    super(`Janus:${code}; ${reason}`);
    this.code = code;
  }
}

/// Message data
export interface Data {
  [index: string]: any;
}

/// Janus plugin data
export interface JSep {
  [index: string]: any;
}

interface MessageError {
  code: number;
  reason: string;
}

/// Janus message
export interface Message extends Data {
  janus: string;
  transaction: string;
  error?: MessageError;
  jsep?: JSep;
}

/// Feed data
export interface FeedData extends Data {
  id: number;
  display?: string;
  talking?: boolean;
  audio_codec?: string;
  video_codec?: string;
}
