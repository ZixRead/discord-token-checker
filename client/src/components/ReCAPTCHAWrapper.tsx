import { ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { RECAPTCHA_SITE_KEY } from '@/const';

interface ReCAPTCHAWrapperProps {
  children: ReactNode;
}

/**
 * reCAPTCHA v3 Provider Wrapper
 * Wraps the application with reCAPTCHA v3 provider
 */
export function ReCAPTCHAWrapper({ children }: ReCAPTCHAWrapperProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
