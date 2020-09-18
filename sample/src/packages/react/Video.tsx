import React, { HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLVideoElement> {
  stream?: MediaStream | null;
}

/// Stream context
export const StreamContext = React.createContext<MediaStream | null>(null);

export default function ({ stream = null, ...props }: Props) {
  stream = React.useContext(StreamContext) || stream;
  const videoElement = React.createRef<HTMLVideoElement>();
  React.useEffect(() => {
    if (videoElement.current) videoElement.current.srcObject = stream;
  });
  return <video ref={videoElement} {...props} autoPlay />;
}
