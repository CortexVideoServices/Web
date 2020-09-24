import React, { HTMLProps, ReactNode } from 'react';
import { PublisherContext } from './Publisher';
import Video, { StreamContext } from './Video';
import { Participant } from '@cvs/session/Participant';

type SwitchTrack = (value: boolean) => void;
type SwitchCamera = (deviceId?: string) => void;

interface ChildrenProps {
  stream: MediaStream | null;
  participantName: string;
  switchCamera: SwitchCamera;
  enableAudio: SwitchTrack;
  enableVideo: SwitchTrack;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  children?: ReactNodeFactory | ReactNode;
}

/// Local stream
export default function ({ children, ...props }: Props) {
  const publisher = React.useContext(PublisherContext);
  if (!publisher) throw new Error('LocalStream must be used within the publisher context');
  const audio = publisher.audio;
  const video = publisher.video;
  const [participant, setParticipant] = React.useState<Participant | null>(null);
  React.useEffect(() => {
    const listener = publisher.addListener({
      onStreamCreated: () => setParticipant(publisher),
      onStreamDestroy: () => setParticipant(null),
    });
    return () => publisher.removeListener(listener);
  });
  const stream = participant ? participant.mediaStream : null;
  const participantName = participant ? participant.name || '' : '';
  if (children) {
    if (children instanceof Function)
      return (
        <>
          {children({
            stream: stream,
            participantName: participantName,
            switchCamera: (deviceId) => publisher.switchCamera(deviceId),
            enableAudio: (value) => publisher.startCapturer(video, value),
            enableVideo: (value) => publisher.startCapturer(value, audio),
          })}
        </>
      );
    else return <StreamContext.Provider value={stream}>{children}</StreamContext.Provider>;
  } else return <Video stream={stream} {...props} />;
}
