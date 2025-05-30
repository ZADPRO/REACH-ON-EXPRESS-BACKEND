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
  *;`;

export const vendorLeafQuery = `SELECT "leaf" FROM public.transactionmapping WHERE "leaf" = $1 LIMIT 1`;

export const refCustIdQuery = `SELECT "refCustId" FROM public.customers WHERE "refCustomerId" = $1 LIMIT 1`;

export const updateVendorLeaf = `UPDATE public.transactionmapping
SET "refStatus" = 'Assigned'
WHERE leaf = $1
  AND "refStatus" = 'Not Assigned';
`;

export const getParcelBookingCount = `SELECT COUNT(*) AS total FROM public.parcelbooking WHERE "parcelBookingId" = $1`;
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
    "consigneePincode",
    "createdAt",
    "createdBy"
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
    $36,
    $37,
    $38
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

export const parselBookingData = `SELECT * FROM public."parcelbooking" pb ORDER BY pb."parcelBookingId" DESC`;

export const refParcelBookingDataQuery = `SELECT * FROM public."parcelbooking" WHERE "vendorLeaf" = $1`;

export const getFinanceDataQuery = `SELECT * FROM public."refFinanceTable" WHERE "refCustomerName" = $1
`;
export const updateFinanceQuery = `UPDATE
  public."refFinanceTable"
SET
  "refPayAmount" = $2,
  "refBalanceAmount" = $3,
WHERE
  "refCustomerName" = $3;
`;

export const getfinanceDataQuery = `SELECT * FROM public."refFinanceTable"
`;

export const getReportDataQuery = `SELECT
    *
  FROM
    public.parcelbooking pb
  WHERE
    pb."refCustomerId" = $1
    AND pb."createdAt" BETWEEN $2 AND $3
  ORDER BY
    pb."parcelBookingId" DESC
`;

export const vendorParcelBookingQuery = `
INSERT INTO public."VendorParcelBooking" (
      vendor,
      leaf,
      type,
      origin,
      destination,
      consignorName,
      consignorAddress,
      consignorCity,
      consignorState,
      consignorGSTnumber,
      consignorPhone,
      consignorEmail,
      customerRefNo,
      consigneeName,
      consigneeAddress,
      consigneeCity,
      consigneeState,
      consigneeGSTnumber,
      consigneePhone,
      consigneeEmail,
      contentSpecification,
      paperEnclosed,
      declaredValue,
      NoOfPieces,
      actualWeight,
      dimension,
      height,
      weight,
      breadth,
      chargedWeight,
      paymentId,
      customerType,
      "refCustomerId",
      netAmount,
      pickUP,
      count,
      formattedDate,
      consignorPincode,
      consigneePincode,
      result,
      createdat,
      "refCustomerName",
      "refCode",
      "parcelStatus",
      "invoiceNum"
    ) VALUES (
      $1,  -- vendor
      $2::jsonb,  -- leaf (JSON)
      $3::jsonb,  -- type (JSON)
      $4,  -- origin
      $5,  -- destination
      $6,  -- consignorName
      $7,  -- consignorAddress
      $8,  -- consignorCity
      $9,  -- consignorState
      $10, -- consignorGSTnumber
      $11, -- consignorPhone
      $12, -- consignorEmail
      $13, -- customerRefNo
      $14, -- consigneeName
      $15, -- consigneeAddress
      $16, -- consigneeCity
      $17, -- consigneeState
      $18, -- consigneeGSTnumber
      $19, -- consigneePhone
      $20, -- consigneeEmail
      $21, -- contentSpecification
      $22, -- paperEnclosed
      $23, -- declaredValue
      $24, -- NoOfPieces
      $25, -- actualWeight
      $26, -- dimension
      $27, -- height
      $28, -- weight
      $29, -- breadth
      $30, -- chargedWeight
      $31, -- paymentId
      $32, -- customerType
      $33, -- refCustomerId
      $34, -- netAmount
      $35, -- pickUP
      $36, -- count
      $37::DATE, -- formattedDate (formatted as YYYY-MM-DD)
      $38, -- consignorPincode
      $39,  -- consigneePincode
      $40::jsonb,  -- result
      $41,  -- created at
      $42, -- ref custoemr name
      $43, -- ref custoemr code
      $44, -- parcel status success or failure
      $45  -- invoice number
    );
`;
