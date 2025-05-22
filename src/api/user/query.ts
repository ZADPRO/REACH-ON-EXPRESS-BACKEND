export const UserLoginQuery = `
  SELECT * FROM public.customers
  WHERE "refPhone" = $1;
`;

export const parcelDetails = `
select * from "public"."VendorParcelBooking" vpc
where vpc."refCustomerId" = $1;
`;
