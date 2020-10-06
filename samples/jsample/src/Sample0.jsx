import * as React from "react";
import { Session, Publisher, Incoming } from "@cvss/react"

export default function ({sessionId, serverUrl}) {
  return (
    <Session sessionId={sessionId || 'SAMPLE'} serverUrl={serverUrl}>
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
  );
}