import Session from '../abc/Session';
import Publisher from '../abc/Publisher';
import JanusConnection from './Connection';
import JanusPublisher from './Publisher';
import { SessionListener, SessionSettings } from '../types/Session';
import { ConnectionState } from '../types/Connection';
import { CVSError } from '../types/common';
import { FeedData, Message } from './types';
import RemoteStream from './RemoteStream';

/// Janus implementation on session
export default class extends Session {
  private janusConnection: JanusConnection;

  constructor(settings: SessionSettings, listener?: SessionListener) {
    super(settings, listener);
    this.janusConnection = new JanusConnection(settings);
  }

  /// Renews connection
  protected createConnection(): JanusConnection {
    if (this.connection && this.connection.state !== ConnectionState.Closed)
      throw new CVSError('Previous connection is not close, but request renew');
    this.janusConnection = new JanusConnection(this.settings, (message) => this.onMessage(message));
    return this.janusConnection;
  }

  /// Starts publishing
  protected async startPublishing(publisher: Publisher): Promise<void> {
    if (publisher instanceof JanusPublisher) {
      await publisher.startPublishing(this.janusConnection);
    } else throw new CVSError('Incorrect publisher type');
  }

  /// Stops publishing
  protected async stopPublishing(publisher: Publisher): Promise<void> {
    if (publisher instanceof JanusPublisher) {
      await publisher.stopPublishing();
    } else throw new CVSError('Incorrect publisher type');
  }

  private remoteFeeds = new Map<number, RemoteStream>();
  private privateId = 0; ////

  private onMessage(message: Message) {
    const data = message.plugindata.data;
    if (data.publishers) {
      if (data.private_id) this.privateId = data.private_id;
      data.publishers.forEach((feed: FeedData) => {
        if (feed.id && !this.remoteFeeds.has(feed.id)) {
          const remoteStream = new RemoteStream(this.settings, this.privateId);
          remoteStream.startSubscribing(this.janusConnection, feed).then((mediaStream) => {
            if (mediaStream) {
              this.emitStreamReceived(remoteStream);
              this.remoteFeeds.set(feed.id, remoteStream);
            }
          });
        }
      });
    } else if (data.unpublished && this.remoteFeeds.has(data.unpublished)) {
      const feedId = parseInt(data.unpublished);
      const remoteStream = this.remoteFeeds.get(feedId);
      remoteStream?.stopSubscribing().finally(() => {
        this.remoteFeeds.delete(feedId);
        this.emitStreamDropped(remoteStream);
      });
    }
  }
}
