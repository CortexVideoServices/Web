import React, { HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLVideoElement> {
  stream?: MediaStream | null;
}

/// Stream context
export const StreamContext = React.createContext<MediaStream | null>(null);

export default function ({ stream = null, ...props }: Props) {
  if (!stream) stream = React.useContext(StreamContext);
  const videoElement = React.createRef<HTMLVideoElement>();
  React.useEffect(() => {
    if (videoElement.current) videoElement.current.srcObject = stream;
  });
  console.log('!!! Video', stream);
  return <video ref={videoElement} {...props} autoPlay />;
}
