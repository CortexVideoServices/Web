import React, { PropsWithChildren } from 'react';
import Publisher from '@cvs/session/abc/Publisher';
import PublisherBuilder from '@cvs/session/PublisherBuilder';
import { AudioConstraints, VideoConstraints } from '../session/types/Constraints';
import { PublisherListener } from '@cvs/session/types/Publisher';
import { SessionContext } from './Session';

interface Props {
  publisherBuilder?: PublisherBuilder;
  participantName?: string;
  audio?: boolean | AudioConstraints;
  video?: boolean | VideoConstraints;
  autoPublishing?: boolean;
  eventHandlers?: PublisherListener;
}

/// Publisher context
export const PublisherContext = React.createContext<Publisher | void>(undefined);

/// Component initializes the local stream publisher and sets its context for children.
export default function ({
  publisherBuilder,
  participantName,
  audio = true,
  video = true,
  autoPublishing = true,
  eventHandlers,
  children,
}: PropsWithChildren<Props>) {
  const session = React.useContext(SessionContext);
  if (!publisherBuilder) {
    if (!session)
      throw new Error('Publisher component must be used in the session context or with the publisher builder.');
    publisherBuilder = new PublisherBuilder(session, participantName, audio, video);
  } else {
    if (participantName) publisherBuilder.participantName = participantName;
    if (publisherBuilder.audio instanceof Boolean) publisherBuilder.audio = audio;
    if (publisherBuilder.video instanceof Boolean) publisherBuilder.video = video;
  }
  if (autoPublishing && !session)
    throw new Error('Publisher component must be used in the session context if enabled auto publishing.');
  const publisher = publisherBuilder.build(eventHandlers, autoPublishing);
  publisher.startCapturer().catch((reason) => console.error('Cannot start capturer', reason));
  return <PublisherContext.Provider value={publisher}>{children}</PublisherContext.Provider>;
}
