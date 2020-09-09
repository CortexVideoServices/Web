import React, { PropsWithChildren } from 'react';
import Session from '@cvs/session/abc/Session';
import SessionBuilder from '@cvs/session/SessionBuilder';
import { SessionListener } from '@cvs/session/types/Session';

interface Props {
  sessionBuilder: SessionBuilder;
  eventHandlers?: SessionListener;
}

/// Session context
export const SessionContext = React.createContext<Session | null>(null);

/// Component initializes the session and sets its context for children.
export default function ({ sessionBuilder, eventHandlers, children }: PropsWithChildren<Props>) {
  const session = sessionBuilder.build(eventHandlers);
  React.useEffect(() => {
    session.connect().catch(console.error);
    return () => session.disconnect();
  });
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
