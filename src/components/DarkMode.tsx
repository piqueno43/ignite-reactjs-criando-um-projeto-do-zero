import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/solid';

import { useHasMounted } from '../hooks/useHasMounted';
import { siteMetadata } from '../_data/siteMetadata';

export const DarkMode = (): void => {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();

  const label =
    resolvedTheme === 'dark' ? 'Activate light mode' : 'Activate dark mode';

  if (!hasMounted) return null;

  const toggleTheme = (): JSX.IntrinsicElements => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // for utterances
    const frame = document.getElementsByClassName(
      'utterances-frame'
    )[0] as HTMLIFrameElement;
    if (frame?.contentWindow) {
      const utterancesTheme =
        resolvedTheme === 'light'
          ? siteMetadata.comment.utterancesConfig.darkTheme
          : siteMetadata.comment.utterancesConfig.theme;
      frame.contentWindow.postMessage(
        { type: 'set-theme', theme: utterancesTheme },
        '*'
      );
    }
  };

  return (
    <button
      className="focus:outline-none"
      type="button"
      title={label}
      aria-label={label}
      onClick={toggleTheme}
    >
      {resolvedTheme === 'light' ? (
        <MoonIcon className="w-8 h-8" />
      ) : (
        <SunIcon className="w-8 h-8" />
      )}
    </button>
  );
};
