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
  *;
  `;

export const updatePartnerQuery = `
UPDATE
  public."partners"
SET
  "partnersName" = $1,
  "phoneNumber" = $2,
  "validity" = $3
WHERE
  "partnersId" = $4
RETURNING
  *;
  `;

export const getCustomerQuery = `
  SELECT
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

export const updateCustomerQuery = `
  UPDATE
  public.customers 
SET
  "refCustId" = $1,
  "refCustomerName" = $2,
  "refCode" = $3,
  "refNotes" = $4,
  "refEmail"=$5,
  "refCustomerType" = $6,
  "refAddress" = $7,
  "refPhone" = $8
WHERE
  "refCustomerId" = $9
RETURNING
  *;`;

export const updateQuery = `
        UPDATE
  public."pricing"
SET
  "partnersId" = $1,
  "minWeight" = $2,
  "maxWeight" = $3,
  "price" = $4,
  "weightORdimension" = $5,
  "refLength" = $6,
  "refBreadth" = $7,
  "refHeight" = $8,
  "calculation" = $9,
  "answer" = $10,
  "updatedAt" = $11,
  "updatedBy" = $12
WHERE
  "pricingId" = $13
RETURNING
  *;
        `;

export const getPartnerQuery = `
SELECT
  "partnersName",
  "refUserId",
  "phoneNumber",
  "validity"
FROM
  public."partners"
WHERE
  "partnersId" = $1
  AND ("isDelete" IS NOT true);
`;

export const deletePartnerQuery = ` 
UPDATE
  public."partners"
SET
  "deletedAt" = $2,
  "deletedBy" = $3,
  "isDelete" = true
WHERE
  "partnersId" = $1;
`;

export const deleteCustomerQuery = `
UPDATE
  public."customers"
SET
  "deletedAt" = $2,
  "deletedBy" = $3,
  "isDelete" = true
WHERE
  "refCustomerId" = $1;
`;

export const deletePricingQuery = `
UPDATE
  public."pricing"
SET
  "deletedAt" = $2,
  "deletedBy" = $3,
  "isDelete" = true
WHERE
  "pricingId" = $1;
`;
