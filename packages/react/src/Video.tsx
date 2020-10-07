import React, { HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLVideoElement> {
  stream?: MediaStream | null;
}

/// RemoteStream context
export const StreamContext = React.createContext<MediaStream | null>(null);

export function Video({ stream = null, muted = true, ...props }: Props) {
  stream = React.useContext(StreamContext) || stream;
  const videoElement = React.createRef<HTMLVideoElement>();
  React.useEffect(() => {
    if (videoElement.current) videoElement.current.srcObject = stream;
  });
  return <video ref={videoElement} muted={muted} {...props} autoPlay />;
}

export default Video;
