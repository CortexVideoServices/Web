import React, { HTMLProps, ReactNode } from 'react';
import { PublisherContext } from './Publisher';
import Publisher from '@cvs/session/abc/Publisher';
import Video, { StreamContext } from './Video';

type SwitchCamera = (deviceId?: string) => void;
type SwitchTrack = (value: boolean) => void;

interface ChildrenProps {
  stream: MediaStream | null;
  switchCamera: SwitchCamera;
  enableAudio: SwitchTrack;
  enableVideo: SwitchTrack;
}

type ReactNodeFactory = (props: ChildrenProps) => ReactNode;

interface Props extends HTMLProps<HTMLVideoElement> {
  publisher?: Publisher | null;
  children?: ReactNodeFactory | ReactNode;
}

/// Local stream
export default function ({ publisher, children, ...props }: Props) {
  if (!publisher) publisher = React.useContext(PublisherContext);
  if (!publisher) throw new Error('LocalParticipant must be used within the publisher context');
  const nnPublisher = publisher;
  const audio = nnPublisher.audio;
  const video = nnPublisher.video;
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  React.useEffect(() => {
    const listener = nnPublisher.addListener({
      onStreamCreated: () => setStream(nnPublisher.mediaStream),
      onStreamDestroy: () => setStream(null),
    });
    return () => nnPublisher.removeListener(listener);
  });
  if (children) {
    if (children instanceof Function)
      return (
        <>
          {children({
            stream,
            switchCamera: (deviceId) => nnPublisher.switchCamera(deviceId),
            enableAudio: (value) => (nnPublisher.audio = value ? audio : false),
            enableVideo: (value) => (nnPublisher.video = value ? video : false),
          })}
        </>
      );
    else return <StreamContext.Provider value={stream}>{children}</StreamContext.Provider>;
  } else return <Video stream={stream} {...props} />;
}
