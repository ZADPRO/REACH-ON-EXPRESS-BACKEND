export const UserLoginQuery = `
  SELECT * FROM public.customers
  WHERE "refPhone" = $1;
`;
