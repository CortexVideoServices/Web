import React, { PropsWithChildren } from 'react';
import { Publisher } from '@cvs/session/Publisher';

interface Props {
  participantName?: string;
  audio?: boolean;
  video?: boolean;
}

export const PublisherContext = React.createContext<Publisher | void>(undefined);

export default function ({
  participantName = 'Anonymous',
  audio = true,
  video = true,
  children,
}: PropsWithChildren<Props>) {
  const publisher = new Publisher({ participantName, audio, video, debug: true, rtcConfiguration: {} });
  publisher.startCapturer().catch((reason) => console.error('Cannot start capturer', reason));
  console.log('!!! Publisher', publisher);
  return <PublisherContext.Provider value={publisher}>{children}</PublisherContext.Provider>;
}
