import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

/**
 * Hook for using reCAPTCHA v3
 */
export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const executeRecaptchaAction = useCallback(
    async (action: string) => {
      if (!executeRecaptcha) {
        console.warn('reCAPTCHA is not ready');
        return null;
      }

      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        return null;
      }
    },
    [executeRecaptcha]
  );

  return { executeRecaptchaAction };
}
