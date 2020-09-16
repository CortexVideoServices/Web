// ToDo: need to be refactored
import React, { HTMLProps, ReactNode } from 'react';
import { IncomingStreamsContext } from './Incoming';
import { Participant } from '../session/Participant';
import Stream from './Stream';

interface ChildrenProps {
  participants: Array<Participant>;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  children?: ReactNodeFactory;
}

/// Participants component
export default function ({ children, ...props }: Props) {
  const incomingStreamsCtx = React.useContext(IncomingStreamsContext);
  if (incomingStreamsCtx === null)
    throw new Error('Participants component must be used within the incoming streams context');
  const participants: Array<Participant> = incomingStreamsCtx;
  if (children instanceof Function) return <>{children({ participants })}</>;
  else
    return (
      <>
        {participants.map((participant) => (
          <Stream participant={participant} {...props} />
        ))}
      </>
    );
}
