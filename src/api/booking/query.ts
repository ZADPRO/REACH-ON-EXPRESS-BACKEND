export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const vendorLeafQuery = `SELECT "leaf" FROM public.transactionmapping WHERE "partnersName" = $1 LIMIT 1`;

export const refCustIdQuery = `SELECT "refCustId" FROM public.customers WHERE "refCustomerId" = $1 LIMIT 1`;

export const parcelBookingQuery = `
INSERT INTO public.parcelbooking (
    "partnersName", "vendorLeaf", "refCustomerId", "refCustId", "customerType",
    "paymentId", "type", "origin", "destination", "consignorName",
    "consignorAddress", "consignorGSTnumber", "consignorPhone", "consignorEmail",
    "customerRefNo", "consigneeName", "consigneeAddress", "consigneeGSTnumber",
    "consigneePhone", "consigneeEmail", "contentSpecification", "paperEnclosed",
    "declaredValue", "NoOfPieces", "actualWeight", "dimension",
    "height", "weight", "breadth", "chargedWeight"
) VALUES (
    $1, $2, $3, $4, $5, 
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15, 
    $16, $17, $18, $19, $20,
    $21, $22, $23, $24, $25, 
    $26, $27, $28, $29, $30
) RETURNING "parcelBookingId";
`;

export const updateRefStatusQuery = `UPDATE public.transactionmapping 
SET "refStatus" = 'Assigned' 
WHERE ctid IN (
    SELECT ctid FROM public.transactionmapping 
    WHERE "partnersName" = $1 
    AND ("refStatus" IS null OR "refStatus" = 'Not Assigned') 
    ORDER BY ctid ASC
    LIMIT 1
);`;

export const getParcelBookingQuery = `
   SELECT pb.*, tm."refStatus", c."refCustomerName" 
    FROM public."parcelbooking" pb
    LEFT JOIN public."transactionmapping" tm ON pb."partnersName" = tm."partnersName"
    LEFT JOIN public."customers" c ON pb."refCustomerId" = c."refCustomerId"
    WHERE pb."parcelBookingId" = $1;
`;
