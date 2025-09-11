export const UserLoginQuery = `
  SELECT * FROM public.customers
  WHERE "refPhone" = $1;
`;

export const parcelDetailsPaginated = `
SELECT *
  FROM public."bulkParcelDataMapping" bpc
  WHERE bpc.dsr_value = $1
    AND (
      bpc.dsr_cnno ILIKE '%' || $4 || '%' OR
      bpc.dsr_dest ILIKE '%' || $4 || '%' OR
      bpc.dsr_dest_pin::text ILIKE '%' || $4 || '%' OR
      bpc.dsr_contents ILIKE '%' || $4 || '%'
    )
  ORDER BY bpc.dsr_booking_date ASC
  LIMIT $2 OFFSET $3;
`;

export const userDetailsQuery = `
select * from public.customers c where c."refCustomerId" = $1;
`;
