import React, { HTMLProps, ReactNode } from 'react';
import { Participant } from '@cvss/classes';
import Video from './Video';

interface ChildrenProps {
  stream: MediaStream | null;
  participantName: string;
  muted: boolean;
  setMuted: (value: boolean) => void;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  participant?: Participant;
  stream?: MediaStream | null;
  participantName?: string;
  index?: number;
  children?: ReactNode | ReactNodeFactory;
}

/// Participants context
export const ParticipantContext = React.createContext<Participant | undefined>(undefined);

/// Remote stream
export function RemoteStream({ participant, stream, participantName, index, children, ...props }: Props) {
  participant = React.useContext(ParticipantContext) || undefined;
  if (!participant) {
    if (!stream)
      throw new Error('RemoteStream component must be used with the stream or within the participant context.');
  } else {
    stream = stream || participant.mediaStream;
    participantName = participantName || participant.name;
  }
  participantName = participantName || '';
  const [muted, setMuted] = React.useState(false);
  props.muted = muted;
  if (typeof children === 'function') {
    return (
      <>
        {children({
          stream: stream,
          participantName: participantName,
          muted,
          setMuted,
        })}
      </>
    );
  } else return <Video key={index} stream={stream} {...props} />;
}

export default RemoteStream;
