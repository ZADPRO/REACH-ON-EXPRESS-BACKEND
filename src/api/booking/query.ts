export const updateHistoryQuery = `
INSERT INTO
  public."reftxnhistory" (
    "transtypeId",
    "refUserId",
    "transdata",
    "transtime",
    "updatedBy"
  )
VALUES
  ($1, $2, $3, $4, $5)
RETURNING
  *;`
  ;

export const vendorLeafQuery = `SELECT "leaf" FROM public.transactionmapping WHERE "partnersName" = $1 LIMIT 1`;

export const refCustIdQuery = `SELECT "refCustId" FROM public.customers WHERE "refCustomerId" = $1 LIMIT 1`;
export const getParcelBookingCount = `SELECT COUNT(*) AS total FROM public.parcelbooking WHERE "parcelBookingId" = $1`
export const parcelBookingQuery = `
INSERT INTO
  public.parcelbooking (
    "partnersName",
    "vendorLeaf",
    "refCustomerId",
    "refCustId",
    "customerType",
    "paymentId",
    "type",
    "origin",
    "destination",
    "consignorName",
    "consignorAddress",
    "consignorGSTnumber",
    "consignorPhone",
    "consignorEmail",
    "customerRefNo",
    "consigneeName",
    "consigneeAddress",
    "consigneeGSTnumber",
    "consigneePhone",
    "consigneeEmail",
    "contentSpecification",
    "paperEnclosed",
    "declaredValue",
    "NoOfPieces",
    "actualWeight",
    "dimension",
    "height",
    "weight",
    "breadth",
    "chargedWeight",
    "bookedDate",
    "netAmount",
    "pickUP",
    count,
    "consignorPincode",
    "consigneePincode"
  )
VALUES
  (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $22,
    $23,
    $24,
    $25,
    $26,
    $27,
    $28,
    $29,
    $30,
    $31,
    $32,
    $33,
    $34,
    $35,
    $36
  )
RETURNING
  *;
`;

export const refParcelBookingQuery = `
INSERT INTO
  public."parcelbooking" (
    "partnersName",
    "vendorLeaf",
    "refCustomerId",
    "refCustId",
    "customerType",
    "paymentId",
    "type",
    "origin",
    "destination",
    "consignorName",
    "consignorAddress",
    "consignorGSTnumber",
    "consignorPhone",
    "consignorEmail",
    "customerRefNo",
    "consigneeName",
    "consigneeAddress",
    "consigneeGSTnumber",
    "consigneePhone",
    "consigneeEmail",
    "contentSpecification",
    "paperEnclosed",
    "declaredValue",
    "NoOfPieces",
    "actualWeight",
    "dimension",
    "height",
    "weight",
    "breadth",
    "chargedWeight",
    "bookedDate",
    "netAmount",
    "pickUP",
    count,
    "consignorPincode",
    "consigneePincode"
  )
VALUES
  (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $22,
    $23,
    $24,
    $25,
    $26,
    $27,
    $28,
    $29,
    $30,
    $31,
    $32,
    $33,
    $34,
    $35,
    $36
  )
RETURNING
  *;
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

export const getCustomerQuery = `SELECT
  "refCustId",
  "refCustomerName",
  "refCode",
  "refNotes",
  "refCustomerType"
FROM
  Public."customers"
WHERE
  "refCustomerId" = $1
  AND (
    "deletedAt" IS NULL
    AND "deletedBy" IS NULL
  );`;

export const addFinanceQuery = `INSERT INTO
  public."refFinanceTable"  (
    "refCustomerName",
    "refOutstandingAmt",
    "refBalanceAmount"
  )
VALUES
  ($1, $2, $3)
RETURNING
  *;

`;

export const parcelBookingUpdateQuery = `UPDATE public.parcelbooking
SET 
  "partnersName" = $1,
  "refCustomerId" = $2,
  "customerType" = $3,
  "paymentId" = $4,
  "type" = $5,
  "origin" = $6,
  "destination" = $7,
  "consignorName" = $8,
  "consignorAddress" = $9,
  "consignorGSTnumber" = $10,
  "consignorPhone" = $11,
  "consignorEmail" = $12,
  "customerRefNo" = $13,
  "consigneeName" = $14,
  "consigneeAddress" = $15,
  "consigneeGSTnumber" = $16,
  "consigneePhone" = $17,
  "consigneeEmail" = $18,
  "contentSpecification" = $19,
  "paperEnclosed" = $20,
  "declaredValue" = $21,
  "NoOfPieces" = $22,
  "actualWeight" = $23,
  "dimension" = $24,
  "height" = $25,
  "weight" = $26,
  "breadth" = $27,
  "chargedWeight" = $28,
  "netAmount" = $29,
  "pickUP" = $30,
  "consignorPincode" = $31,
  "consigneePincode" = $32
WHERE "parcelBookingId" = $33;`;

export const refParcelBookingUpdateQuery = `UPDATE public.refParcelbooking
SET 
  "partnersName" = $1,
  "refCustomerId" = $2,
  "customerType" = $3,
  "paymentId" = $4,
  "type" = $5,
  "origin" = $6,
  "destination" = $7,
  "consignorName" = $8,
  "consignorAddress" = $9,
  "consignorGSTnumber" = $10,
  "consignorPhone" = $11,
  "consignorEmail" = $12,
  "customerRefNo" = $13,
  "consigneeName" = $14,
  "consigneeAddress" = $15,
  "consigneeGSTnumber" = $16,
  "consigneePhone" = $17,
  "consigneeEmail" = $18,
  "contentSpecification" = $19,
  "paperEnclosed" = $20,
  "declaredValue" = $21,
  "NoOfPieces" = $22,
  "actualWeight" = $23,
  "dimension" = $24,
  "height" = $25,
  "weight" = $26,
  "breadth" = $27,
  "chargedWeight" = $28,
  "netAmount" = $29,
  "pickUP" = $30,
  "consignorPincode" = $31,
  "consigneePincode" = $32
WHERE "refParcelBookingId" = $33;`;

export const getParcelBookingQuery = `
   SELECT pb.*, tm."refStatus", c."refCustomerName" 
    FROM public."parcelbooking" pb
    LEFT JOIN public."transactionmapping" tm ON pb."partnersName" = tm."partnersName"
    LEFT JOIN public."customers" c ON pb."refCustomerId" = c."refCustomerId"
    WHERE pb."parcelBookingId" = $1;
`;

export const getPaymentQuery = `SELECT "paymentId", "paymentName" FROM public."refModeOfPayment" `;

export const parselBookingData = `SELECT * FROM public.parcelbooking pb ORDER BY pb."parcelBookingId" DESC`;

export const refParcelBookingDataQuery = `SELECT * FROM public."refparcelbooking" WHERE "vendorLeaf" = $1`;

export const getFinanceDataQuery = `SELECT * FROM public."refFinanceTable" WHERE "refCustomerName" = $1
`;
 
export const updateFinanceQuery =`UPDATE
  public."refFinanceTable"
SET
  "refPayAmount" = $2,
  "refBalanceAmount" = $3,
WHERE
  "refCustomerName" = $3;
`;

export const getfinanceDataQuery = `SELECT * FROM public."refFinanceTable"
`
;