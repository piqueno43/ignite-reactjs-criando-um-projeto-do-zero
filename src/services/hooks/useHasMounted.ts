import * as React from 'react';

export const useHasMounted = (): boolean => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};
