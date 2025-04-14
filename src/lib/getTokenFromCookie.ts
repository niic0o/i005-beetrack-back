export const getTokenFromCookie = (req: Request): string | undefined => {
  return req.headers
    .get('cookie')
    ?.split('; ')
    .find((c) => c.startsWith('token='))
    ?.split('=')[1];
};
