import {createElement, useState} from 'react';

export interface Resource<T> {
  value: T | null;
  failure: Error | null;
  load(): ResourceData<T>;
  invalidate: () => void;
}

export interface ResourceData<T> {
  data: T | null;
  loading: boolean;
  Serialized: () => JSX.Element | null;
  useInvalidate: ReturnType<typeof buildUseInvalidateHook>;
}

export const buildResource = <T>(getValue: () => Promise<T>, resourceName: string): Resource<T> => {
  const getSerialized = (value?: T) => () =>
    createElement('div', {
      id: `data-${resourceName}`,
      style: {display: 'none'},
      children: JSON.stringify(value || {}),
    });

  const useInvalidate = buildUseInvalidateHook(resourceName);
  const resource: Resource<T> = {
    value: null,
    failure: null,
    load: () => {
      // console.log('fetch', resource, cachedResult);

      if (resource.value) {
        return {
          loading: false,
          data: resource.value,
          Serialized: getSerialized(resource.value),
          useInvalidate,
        };
      }

      if (typeof window !== 'undefined' && resource.value == null && resourceName) {
        const clientContainer = document.querySelector(`#data-${resourceName}`);
        if (clientContainer) {
          const parsedValue = parse<T>(clientContainer.innerHTML);
          if (parsedValue) {
            return {
              loading: false,
              data: parsedValue,
              Serialized: getSerialized(parsedValue),
              useInvalidate,
            };
          }
        }
      }

      if (resource.value == null) {
        // console.log('called resource.fetch()', resource);
        const suspender = getValue().then(
          (value) => {
            resource.value = value;
          },
          (error) => {
            resource.failure = error;
          },
        );

        throw suspender;
      }

      return {
        data: null,
        loading: true,
        Serialized: getSerialized(),
        useInvalidate,
      };
    },
    invalidate: () => {
      resource.value = null;
    },
  };

  return resource;
};

function parse<T>(value: string, fallback: T | null = null): T | null {
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.log('cannot parse: ' + value);
  }
  return fallback;
}

function buildUseInvalidateHook(resourceName: string) {
  return () => {
    const [state, setState] = useState({
      loading: false,
      status: 'stale' as 'stale' | 'complete' | 'fail' | 'progress',
      error: null as Error | null,
    });

    const handleInvalidate = () => {
      setState((state) => ({...state, status: 'progress', loading: true}));
      fetch(`/api/resources/${resourceName}/invalidate`, {
        method: 'POST',
      })
        .then((res) => res.json())
        .then(({status, errors = []}) => {
          setState((state) => ({...state, loading: false, status, error: errors[0]}));
        })
        .catch((err) => {
          console.log(err, typeof err);
          setState((state) => ({...state, loading: false, status: 'fail', error: err}));
        });
    };

    return {
      ...state,
      invalidate: handleInvalidate,
    };
  };
}
