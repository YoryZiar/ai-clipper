import React from 'react';
import ReactPlayer from 'react-player';
import { renderToString } from 'react-dom/server';

console.log(renderToString(React.createElement(ReactPlayer, { onDuration: () => {} })));
