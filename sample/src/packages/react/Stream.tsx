import React, { HTMLProps, ReactNode } from 'react';
import { Participant } from '../session/Participant';
import Video from './Video';

type SwitchTrack = (value: boolean) => void;

interface ChildrenProps {
  stream: MediaStream | null;
  participantName: string;
  enableAudio: SwitchTrack;
  enableVideo: SwitchTrack;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  participant?: Participant;
  index?: number;
  children?: ReactNode | ReactNodeFactory;
}

/// Participants context
export const ParticipantContext = React.createContext<Participant | undefined>(undefined);

/// Remote stream
export default function ({ participant, index, children, ...props }: Props) {
  if (!participant) participant = React.useContext(ParticipantContext) || undefined;
  if (!participant)
    throw new Error('Stream component must be used with the participant or within the participant context.');
  if (children instanceof Function) {
    const stream = participant ? participant.mediaStream : null;
    const participantName = participant ? participant.name || '' : '';
    return (
      <>
        {children({
          stream: stream,
          participantName: participantName,
          enableAudio: (value) => null,
          enableVideo: (value) => null,
        })}
      </>
    );
  } else return <Video key={index} stream={participant.mediaStream} {...props} />;
}
