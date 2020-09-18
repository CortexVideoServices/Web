import React, { HTMLProps, ReactNode } from 'react';
import { SessionContext } from './Session';
import { Participant } from '@cvs/session/Participant';
import Stream from './Stream';

interface Props extends HTMLProps<HTMLVideoElement> {
  clone?: boolean;
  children?: ReactNode;
}

/// Participants context
export const ParticipantsContext = React.createContext<Array<Participant>>([]);

/// Remote stream receiver
export default function ({ clone = false, children, ...props }: Props) {
  const session = React.useContext(SessionContext);
  if (!session) throw new Error('Incoming component must be used within the session context.');
  const [participants, setParticipants] = React.useState<Array<Participant>>(session.remoteStreams);
  React.useEffect(() => {
    const listener = session.addListener({
      onStreamReceived: (participant) => {
        setParticipants(session.remoteStreams);
      },
      onStreamDropped: (participant) => {
        setParticipants(session.remoteStreams);
      },
    });
    return () => session.removeListener(listener);
  });
  children = children || <Stream clone={clone} {...props} />;
  return <ParticipantsContext.Provider value={participants}>{children}</ParticipantsContext.Provider>;
}
