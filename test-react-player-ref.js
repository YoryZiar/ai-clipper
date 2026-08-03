import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { renderToString } from 'react-dom/server';

function App() {
  const ref = useRef(null);
  if (ref.current) {
     console.log('Methods:', Object.keys(ref.current));
  }
  return <ReactPlayer ref={ref} url="test.mp4" />;
}
renderToString(<App />);
