import * as React from 'react';
import { Publisher } from '@cvs/react';
import LocalStream from '@cvs/react/LocalStream';

export default function () {
  return (
    <Publisher>
      <LocalStream />
    </Publisher>
  );
}
