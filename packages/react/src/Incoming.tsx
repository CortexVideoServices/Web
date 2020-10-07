import React, { HTMLProps, ReactNode } from 'react';
import { SessionContext } from './Session';
import { Participant } from '@cvss/classes';
import RemoteStream, { ParticipantContext } from './RemoteStream';

interface Props extends HTMLProps<HTMLVideoElement> {
  clone?: boolean;
  children?: ReactNode;
}

/// Participants context
export const ParticipantsContext = React.createContext<Array<Participant>>([]);

/// Remote stream receiver
export function Incoming({ clone = true, children, ...props }: Props) {
  const session = React.useContext(SessionContext);
  if (!session) throw new Error('Incoming component must be used within the classes context.');
  const [participants, setParticipants] = React.useState<Array<Participant>>(session.remoteStreams);
  React.useEffect(() => {
    const listener = session.addListener({
      onStreamReceived: () => {
        setParticipants(session.remoteStreams);
      },
      onStreamDropped: () => {
        setParticipants(session.remoteStreams);
      },
    });
    return () => session.removeListener(listener);
  });
  const participantsToOut = !clone && participants.length ? [participants[0]] : participants;
  return (
    <>
      {participantsToOut.map((participant, index) => {
        children = children || (participant ? <RemoteStream participant={participant} {...props} /> : <></>);
        return (
          <ParticipantContext.Provider value={participant} key={index}>
            {children}
          </ParticipantContext.Provider>
        );
      })}
    </>
  );
}

export default Incoming;
