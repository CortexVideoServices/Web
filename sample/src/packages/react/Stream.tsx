import React, { HTMLProps, ReactNode } from 'react';
import { ParticipantsContext } from './IncomingStream';
import { Participant } from '../session/Participant';
import Video from './Video';

type SwitchTrack = (value: boolean) => void;

interface ChildrenProps {
  stream: MediaStream | null;
  participantName: string;
  // enableAudio: SwitchTrack;
  // enableVideo: SwitchTrack;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  participant?: Participant;
  clone?: boolean;
  children?: ReactNode | ReactNodeFactory;
}

/// Remote stream
export default function ({ participant, clone = false, children, ...props }: Props) {
  let participants = participant ? [participant] : React.useContext(ParticipantsContext);
  if (participants.length && !clone) participants = [participants[0]];
  if (children instanceof Function) return <></>;
  else
    return (
      <>
        {participants.map((participant, index) => (
          <Video key={index} stream={participant.mediaStream} {...props} />
        ))}
      </>
    );
}
