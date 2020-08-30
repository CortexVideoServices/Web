import React, { HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLVideoElement> {
  stream: MediaStream | null;
}

export default function ({ stream, ...props }: Props) {
  const videoElement = React.createRef<HTMLVideoElement>();
  React.useEffect(() => {
    if (videoElement.current) videoElement.current.srcObject = stream;
  });
  console.log('!!! Video', stream);
  return <video ref={videoElement} {...props} autoPlay />;
}
