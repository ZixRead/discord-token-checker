import { useEffect } from 'react';

interface AdSenseProps {
  slotId: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
}

/**
 * Google AdSense Component
 * Displays a Google AdSense advertisement
 */
export function AdSense({ slotId, format = 'auto', responsive = true }: AdSenseProps) {
  useEffect(() => {
    try {
      // Push the ad to Google AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
        }}
        data-ad-client="ca-pub-6484703241838115"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

/**
 * Declare window.adsbygoogle for TypeScript
 */
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
