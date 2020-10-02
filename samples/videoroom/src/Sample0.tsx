import * as React from "react";
import { Session, Publisher, Incoming } from "@cvss/react"
import { SessionListener, PublisherListener } from "@cvss/classes";


interface Props {
  sessionId?: string;
  serverUrl?: string;
  sessionListener?: SessionListener;
  publisherListener?: PublisherListener;
}

export default function ({sessionId, serverUrl}: Props) {
  return (
    <Session sessionId={sessionId || 'TEST0021'} serverUrl={serverUrl}>
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}