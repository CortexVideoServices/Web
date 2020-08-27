import * as React from 'react';
import { CVSError } from '@cvs/session';

export const Think = () => {
  var message = 'All should be good!';
  try {
    throw new CVSError('But shits happens.');
  } catch (e) {
    message = `${message} ${e.toString()}`;
  }
  return <div>{message}</div>;
};
