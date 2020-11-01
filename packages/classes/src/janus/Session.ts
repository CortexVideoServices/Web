import Session, { SessionListener, SessionSettings } from '../Session';
import Connection, { ConnectionState } from '../Connection';
import { ParticipantSettings } from '../Participant';
import { FeedData, Message } from './common';
import { CVSError } from '../common';
import JanusConnection from './Connection';
import JanusPublisher from './Publisher';
import RemoteParticipant from './Participant';

/// Janus implementation on classes
export class JanusSession extends Session {
  private privateId = 0;
  private janusConnection: JanusConnection;
  //private participantSettings: ParticipantSettings;
  private remoteFeeds = new Map<number, RemoteParticipant>();

  constructor(settings: SessionSettings, listener?: SessionListener) {
    super(settings, listener);
    this.janusConnection = new JanusConnection(settings);
    //this.participantSettings = { ...settings };
  }

  async disconnect(): Promise<void> {
    for (const participant of this.remoteStreams) {
      await (participant as RemoteParticipant).stopSubscribing();
    }
    await super.disconnect();
  }

  protected createConnection(): Connection {
    if (this.connection && this.connection.state !== ConnectionState.Closed)
      throw new CVSError('Previous connection is not close, but request renew');
    this.janusConnection = new JanusConnection(this.settings, {
      onEventMessage: (message) => this.onEventMessage(message),
    });
    return this.janusConnection;
  }

  protected async startPublishing(publisher: JanusPublisher): Promise<void> {
    await publisher.startPublishing(this.janusConnection, this.settings.sessionId);
    this.emitPublishingStarted(publisher);
  }

  protected async stopPublishing(publisher: JanusPublisher): Promise<void> {
    await publisher.stopPublishing();
    this.emitPublishingStopped(publisher);
  }

  protected async closeAll(): Promise<void> {
    this.remoteFeeds.forEach((participant) =>
      participant.stopSubscribing().finally(() => null /*this.emitStreamDropped(participant)*/)
    );
  }

  private onEventMessage(message: Message) {
    const data = message.plugindata.data;
    if (data.publishers) {
      if (!data.private_id) this.privateId = data.private_id;
      data.publishers.forEach((feed: FeedData) => {
        if (feed.id && !this.remoteFeeds.has(feed.id)) {
          const settings: ParticipantSettings = {
            ...this.settings,
            participantName: feed.display || 'Remote participant',
          };
          const remoteParticipant = new RemoteParticipant(settings, {
            onError: (reason) => this.emitError(reason),
            onStreamCreated: (participant) => this.emitStreamReceived(participant),
            onStreamDestroy: (participant) => this.emitStreamDropped(participant),
          });
          remoteParticipant.startSubscribing(this.janusConnection, this.settings.sessionId, feed, this.privateId).then(() => {
            this.remoteFeeds.set(feed.id, remoteParticipant);
          });
        }
      });
    } else if (data.unpublished && this.remoteFeeds.has(data.unpublished)) {
      const feedId = parseInt(data.unpublished);
      const remoteParticipant = this.remoteFeeds.get(feedId);
      remoteParticipant?.stopSubscribing().finally(() => {
        this.remoteFeeds.delete(feedId);
      });
    }
  }
}

export default JanusSession;
