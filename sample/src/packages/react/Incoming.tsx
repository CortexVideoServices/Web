// ToDo: need to be refactored
import React, { HTMLProps, ReactNode } from 'react';
import { SessionContext } from './Session';
import { Participant } from '../session/Participant';
import Stream from './Stream';

interface Props extends HTMLProps<HTMLVideoElement> {
  children?: ReactNode;
}

/// Incoming streams context
export const IncomingStreamsContext = React.createContext<Array<Participant> | null>(null);

/// Incoming streams context component
export default function ({ children, ...props }: Props) {
  const session = React.useContext(SessionContext);
  if (!session) throw new Error('Incoming streams context must be used within the session context');
  const [streams, setStreams] = React.useState<Array<Participant>>([]);
  React.useEffect(() => {
    const listener = session.addListener({
      onStreamReceived: () => setStreams(session.remoteStreams),
      onStreamDropped: () => setStreams(session.remoteStreams),
    });
    return () => session.removeListener(listener);
  });
  console.log('#IncomingStreamsContext.Provider', streams);
  if (children) {
    return <IncomingStreamsContext.Provider value={streams}>{children}</IncomingStreamsContext.Provider>;
  } else return streams.length ? <Stream participant={streams[0]} {...props} /> : <></>;
}
