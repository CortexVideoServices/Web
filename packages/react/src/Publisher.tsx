import React, { HTMLProps, ReactNode } from 'react';
import { SessionContext } from './Session';
import { Publisher as CvsPublisher, PublisherListener } from '@cvss/classes';
import { AudioConstraints, VideoConstraints } from '@cvss/classes';
import { PublisherBuilder } from '@cvss/classes';
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
export const PublisherContext = React.createContext<CvsPublisher | null>(null);

/// Local stream publisher
export function Publisher({
  participantName,
  audio = true,
  video = true,
  autoPublishing = true,
  eventHandlers = undefined,
  children = null,
  ...props
}: Props) {
  const session = React.useContext(SessionContext);
  if (!session) throw new Error('Publisher component must be used within the classes context.');
  const publisherBuilder = new PublisherBuilder(session, participantName, audio, video);
  if (participantName) publisherBuilder.participantName = participantName;
  if (publisherBuilder.audio instanceof Boolean) publisherBuilder.audio = audio;
  if (publisherBuilder.video instanceof Boolean) publisherBuilder.video = video;
  const publisher = publisherBuilder.build(eventHandlers, autoPublishing);
  React.useEffect(() => {
    publisher.startCapturer().catch(console.error);
    return () => {
      publisher.stopCapturer().catch(console.error);
    };
  });
  children = children || <LocalStream {...props} />;
  return <PublisherContext.Provider value={publisher}>{children}</PublisherContext.Provider>;
}

export default Publisher;