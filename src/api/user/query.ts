export const UserLoginQuery = `
  SELECT * FROM public.customers
  WHERE "refPhone" = $1;
`;

export const parcelDetails = `
select * from public."bulkParcelDataMapping" bpc where bpc.dsr_value = $1 ORDER BY bpc.id ASC;
`;

export const userDetailsQuery = `
select * from public.customers c where c."refCustomerId" = $1;
`;
