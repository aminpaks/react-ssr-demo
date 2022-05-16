import React, { useEffect, useState, startTransition } from 'react';
import SlowMessage from './Message';

export function App() {
  const [clientMessage, setClientMessage] = useState('');

  useEffect(() => {
    startTransition(() => setClientMessage('Client message'));
  });

  return (
    <>
      <h1>SSR + Data Fetching Demo</h1>
      <p>The first server render should take about 5 seconds to load the resource and cache it.</p>
      <React.Suspense fallback={<h3>During this time you see this loading message...</h3>}>
        <SlowMessage />
      </React.Suspense>
      <h2>{clientMessage}</h2>
    </>
  );
}

export function Html({ children }: { children?: React.ReactElement }) {
  return (
    <html>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
