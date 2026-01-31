import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function KitchenSinkPage() {
  const router = useRouter();
  const iframeRef = useRef(null);

  useEffect(() => {
    // Get the current path after /app/kitchensink
    const slug = router.query.slug || [];
    const path = Array.isArray(slug) ? slug.join('/') : slug;
    const hash = path ? `#/${path}` : '#/';
    
    // Update iframe src when route changes
    if (iframeRef.current) {
      const baseUrl = '/kitchensink-app/index.html';
      iframeRef.current.src = `${baseUrl}${hash}`;
    }
  }, [router.query.slug]);

  return (
    <>
      <Head>
        <title>Konsta UI Kitchen Sink - ReVive</title>
        <meta name="description" content="Konsta UI component demos" />
      </Head>
      
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        backgroundColor: '#f5f5f5' 
      }}>
        <iframe
          ref={iframeRef}
          src="/kitchensink-app/index.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
          }}
          title="Konsta UI Kitchen Sink"
        />
      </div>
    </>
  );
}