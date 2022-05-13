import React from 'react';
import {resource} from './message-resource';

export default function Message() {
  const {data, Serialized, useInvalidate} = resource.load();
  const {
    status: invalidationStatus,
    loading: invalidationLoading,
    error: invalidationError,
    invalidate,
  } = useInvalidate();
  // console.log({invalidationLoading, invalidationError});
  // console.log('rendering <Message /> component');

  return (
    <div>
      <h2>{data?.value}</h2>
      <p>If you refresh the page now, it should load instantly.</p>
      <div>
        <p>
          Without invalidating the resource cache on the server, when you refresh the this page, it should load very
          fast.{' '}
          <button disabled={invalidationLoading} type="button" onClick={invalidate}>
            Invalidate the cache now!
          </button>
        </p>
        {invalidationError && <p>Failed to invalidate: {JSON.stringify(invalidationError)}</p>}
        {invalidationStatus === 'complete' && <p>Invalidation completed, you should refresh the page now.</p>}
      </div>
      <Serialized />
    </div>
  );
}
