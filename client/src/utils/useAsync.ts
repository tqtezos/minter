import { useState, useEffect } from 'react';

export default function useAsync<T>(fn: () => Promise<T>, deps: any[]) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<T | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);
  useEffect(() => {
    setLoading(true);
    fn().then(
      data => {
        if (!shouldFetch) return;
        setLoading(false);
        setData(data);
      },
      error => {
        if (!shouldFetch) return;
        setLoading(false);
        setError(error);
      }
    );
    return () => {
      setShouldFetch(false);
    };
  }, [shouldFetch, ...deps]);
  return { loading, error, data, refetch: () => setShouldFetch(true) };
}
