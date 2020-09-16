import React, { HTMLProps, ReactNode } from 'react';
import { SessionContext } from './Session';
import { PublisherListener } from '@cvs/session/Publisher';
import { AudioConstraints, VideoConstraints } from '@cvs/session/Constraints';
import PublisherBuilder from '@cvs/session/PublisherBuilder';
import Publisher from '@cvs/session/Publisher';
import LocalStream from './LocalStream';

interface Props extends HTMLProps<HTMLVideoElement> {
  publisherBuilder?: PublisherBuilder;
  participantName?: string;
  audio?: boolean | AudioConstraints;
  video?: boolean | VideoConstraints;
  autoPublishing?: boolean;
  eventHandlers?: PublisherListener;
  children?: ReactNode;
}

/// Publisher context
export const PublisherContext = React.createContext<Publisher | null>(null);

/// Local stream publisher
export default function ({
  publisherBuilder,
  participantName,
  audio = true,
  video = true,
  autoPublishing = true,
  eventHandlers = undefined,
  children = null,
  ...props
}: Props) {
  const session = React.useContext(SessionContext);
  if (!publisherBuilder) {
    if (session) publisherBuilder = new PublisherBuilder(session, participantName, audio, video);
    else if (autoPublishing)
      throw new Error('Publisher component must be used within the session context if enabled auto publishing.');
  }
  if (!publisherBuilder)
    throw new Error('Publisher component must be used within the session context or with the publisher builder.');
  if (participantName) publisherBuilder.participantName = participantName;
  if (publisherBuilder.audio instanceof Boolean) publisherBuilder.audio = audio;
  if (publisherBuilder.video instanceof Boolean) publisherBuilder.video = video;
  const publisher = publisherBuilder.build(eventHandlers, autoPublishing);
  React.useEffect(() => {
    publisher.startCapturer().catch(console.error);
    return () => {
      publisher.stopPublishing().catch(console.error);
    };
  });
  console.log('#PublisherContext.Provider', publisher);
  children = children || <LocalStream {...props} />;
  return <PublisherContext.Provider value={publisher}>{children}</PublisherContext.Provider>;
}
