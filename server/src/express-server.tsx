import express from 'express';
import React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import {resource} from '../../client/src/message-resource';
import {Html, App} from '../../client/src/App';

const app = express();

app.get('/', (_, res) => {
  let didError = false;
  const stream = ReactDOMServer.renderToPipeableStream(
    <Html>
      <App />
    </Html>,
    {
      bootstrapScripts: ['app.js'],
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-type', 'text/html');
        stream.pipe(res);
      },
      onShellError() {
        res.statusCode = 500;
        res.send('<!doctype html><p>error</p>');
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    },
  );
});

app.post('/api/resources/:resourceId/invalidate', async (req, res) => {
  const operation = 'invalidation';
  res.set('Content-Type', 'application/json');

  const resourceId = req.params['resourceId'];

  await new Promise((resolve) => setTimeout(resolve, 1000));

  switch (resourceId) {
    case 'message': {
      resource.invalidate();

      return res.json({
        resource: resourceId,
        operation,
        status: 'complete',
        data: {},
      });
    }
    default:
      break;
  }

  return res.json({
    resource: resourceId,
    operation,
    status: 'fail',
    errors: [{message: 'Resource not found!'}],
  });
});

app.use(express.static('./build'));

app.listen(8000);
