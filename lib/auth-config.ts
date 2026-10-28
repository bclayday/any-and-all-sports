export const isGoogleAuthConfigured = (): boolean => {
  return process.env.NEXT_PUBLIC_AUTH_PROVIDER_GOOGLE === '1';
};
