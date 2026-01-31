import { useRouter } from 'next/router';

/**
 * Custom hook that bridges Framework7-style navigation to Next.js router
 * This allows pages to use Framework7-style navigation while maintaining
 * Next.js deep linking support
 */
export function useAppRouter() {
  const router = useRouter();

  return {
    navigate: (path) => {
      // Remove leading slash if present, ensure /app prefix
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      router.push(`/app/${cleanPath}`);
    },
    back: () => {
      router.back();
    },
    currentPath: router.asPath.replace('/app', '') || '/capture',
  };
}

