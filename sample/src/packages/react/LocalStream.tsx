import React, { HTMLProps } from 'react';
import { PublisherContext } from './Publisher';
import Video from './Video';

interface Props extends HTMLProps<HTMLVideoElement> {}

export default function (props: Props) {
  const publisher = React.useContext(PublisherContext);
  if (!publisher) throw new Error('LocalParticipant must be used in the publisher context');

  const [stream, setStream] = React.useState<MediaStream | null>(null);
  React.useEffect(() => {
    const listener = publisher.addListener({
      onStreamCreated: () => setStream(publisher.mediaStream),
      onStreamDestroy: () => setStream(null),
    });
    return () => publisher.removeListener(listener);
  });
  console.log('!!! LocalStream', stream);
  return <Video stream={stream} />;
}
