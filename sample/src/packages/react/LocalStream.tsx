import React, { HTMLProps, ReactNode } from 'react';
import { PublisherContext } from './Publisher';
import Video, { StreamContext } from './Video';

type SwitchTrack = (value: boolean) => void;
type SwitchCamera = (deviceId?: string) => void;

interface ChildrenProps {
  stream: MediaStream | null;
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
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  React.useEffect(() => {
    const listener = publisher.addListener({
      onStreamCreated: () => setStream(publisher.mediaStream),
      onStreamDestroy: () => setStream(null),
    });
    return () => publisher.removeListener(listener);
  });
  if (children) {
    if (children instanceof Function)
      return (
        <>
          {children({
            stream,
            switchCamera: (deviceId) => publisher.switchCamera(deviceId),
            enableAudio: (value) => publisher.startCapturer(video, value ? audio : false),
            enableVideo: (value) => publisher.startCapturer(value ? video : false, audio),
          })}
        </>
      );
    else return <StreamContext.Provider value={stream}>{children}</StreamContext.Provider>;
  } else return <Video stream={stream} {...props} />;
}
