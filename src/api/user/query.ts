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
  ORDER BY bpc.id DESC
  LIMIT $2 OFFSET $3;
`;

export const userDetailsQuery = `
select * from public.customers c where c."refCustomerId" = $1;
`;

export const userParcelDetailsAnalysisQuery = `
SELECT
    TO_CHAR(TO_DATE(dsr_booking_date, 'DD-MM-YYYY'), 'MM-YYYY') AS month_year,
    COUNT(*) AS total_parcels
FROM public."bulkParcelDataMapping" bpc
WHERE bpc.dsr_value = $1
GROUP BY TO_CHAR(TO_DATE(dsr_booking_date, 'DD-MM-YYYY'), 'MM-YYYY')
ORDER BY TO_DATE(TO_CHAR(TO_DATE(dsr_booking_date, 'DD-MM-YYYY'), 'MM-YYYY'), 'MM-YYYY') DESC;
`;

export const latestParcelData = `
SELECT *
  FROM public."bulkParcelDataMapping" bpc
  WHERE bpc.dsr_value = $1
  ORDER BY bpc.id DESC
  LIMIT 1;
`;

export const indivParcelQuery = `
  SELECT *
  FROM public."bulkParcelDataMapping" bpc
  WHERE bpc.id = $1
  ORDER BY bpc.id DESC
  LIMIT 1;
`;
