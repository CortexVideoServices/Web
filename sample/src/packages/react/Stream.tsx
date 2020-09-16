// ToDo: need to be refactored
import React, { HTMLProps, ReactNode } from 'react';
import { Participant } from '../session/Participant';
import Video from './Video';

export type SwitchTrack = (value: boolean) => void;

interface ChildrenProps {
  stream: MediaStream | null;
  // enableAudio: SwitchTrack;
  // enableVideo: SwitchTrack;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  participant: Participant;
  children?: ReactNodeFactory;
}

/// Stream component
export default function ({ participant, children, ...props }: Props) {
  // const audio = participant.audio;
  // const video = participant.video;
  if (children instanceof Function)
    return (
      <>
        {children({
          stream: participant.mediaStream,
          // enableAudio: (value) => (participant.audio = value ? audio : false),
          // enableVideo: (value) => (participant.video = value ? video : false),
        })}
      </>
    );
  else return <Video stream={participant.mediaStream} {...props} />;
}
