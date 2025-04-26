export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const getLastEmployeeIdQuery = `
SELECT COUNT(*)
FROM public."user" u
WHERE u."refCustId" LIKE 'R-' || $1 || '-%'
  `;

export const getLastCustomerIdQuery = `
SELECT COUNT(*)
FROM public."user" u
WHERE u."refCustId" LIKE 'R-' || $1 || '-%'

    `;

export const checkQuery = `SELECT * FROM public."refusersdomain" WHERE "refUsername"=$1 LIMIT 10;`;

export const insertUserQuery = `INSERT INTO public."user" ("refUserFName", "refUserLName", "designation",  "userTypeId", "refCustId","dateOfBirth", "qualification", "bankAccountNumber", "bankBranch", "pfDeduction", "salary", "finalSalary", "ifsc") 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`;

export const insertUserDomainQuery = `INSERT INTO public."refusersdomain" (
"refUserId", "refCustMobileNum","refCustpassword", "refCusthashedpassword", "refUsername" )
VALUES ($1, $2,$3, $4, $5)
RETURNING *;`;
export const insertUserCommunicationQuery = `INSERT INTO public."refCommunication" (
"refUserId", "refMobileNo", "refEmail") VALUES ($1, $2, $3)
RETURNING *;`;

export const getAllEmployeeQuery = `select * from 
public.user u 
JOIN public.refusersdomain rud ON u."refUserId" = rud."refUserId"
JOIN public."refCommunication" rcu on u."refUserId" = rcu."refUserId"
JOIN public.usertype ut ON u."userTypeId" = ut."userTypeId"
`;
// TESTING CODE

export const getUsertypeQuery = `SELECT * FROM public."usertype"
`;

export const fetchProfileData = `SELECT
    u."refUserFName", u."refCustId", u."refUserLName", u."userTypeId", 
    rc."refMobileNo", rc."refEmail", 
    rua."refCity", rua."refState", rua."refPincode",
    rud."refCustMobileNum", rud."refCustpassword", rud."refCusthashedpassword"
FROM "user" u
LEFT JOIN "refCommunication" rc ON u."refUserId" = rc."refUserId"
LEFT JOIN "refUserAddress" rua ON u."refUserId" = rua."refUserId"
LEFT JOIN "refusersdomain" rud ON u."refUserId" = rud."refUserId" WHERE u."refUserId" = $1;`;

export const selectUserByLogin = `SELECT 
    "refUserId", "refCusthashedpassword"
FROM public."refusersdomain" WHERE "refUsername" = $1 OR "refCustMobileNum" = $1;`;

export const userDetailsQuery = `
SELECT
  u."refUserId",
  u."refCustId",
  u."refUserFName",
  u."refUserLName",
  u."userTypeId",
  rud."refCustMobileNum",
  rud."refCustpassword",
  rud."refCusthashedpassword",
  rud."refUsername",
  ut."userTypeName" 
FROM
  public."user" u
  JOIN "refusersdomain" as rud ON u."refUserId" = rud."refUserId"
  JOIN "usertype" ut ON u."userTypeId" = ut."userTypeId"
WHERE
  u."refUserId" = $1`;

export const addPartnerQuery = `INSERT INTO public."partners" ("partnersName", "refUserId", "phoneNumber", "validity")
  VALUES ($1, $2, $3, $4)
  RETURNING *;`;

export const updatePartnerQuery = `UPDATE public."partners" SET "partnersName" = $1, "phoneNumber" = $2, "validity" = $3
  WHERE "partnersId" = $4 RETURNING *;`;

export const getPartnerQuery = `
SELECT "partnersName", "refUserId", "phoneNumber", "validity" 
FROM public."partners" 
WHERE "partnersId" = $1 
AND ("deletedAt" IS NULL AND "deletedBy" IS NULL);`;

export const getPartnersQuery = `SELECT * FROM public."partners"`;

export const softDeleteQuery = ` UPDATE public."partners" SET "deletedAt" = NOW(), "deletedBy" = 'Admin'
WHERE "partnersId" = $1;
`;

// export const getLastCustomerRefIdQuery = `
//     SELECT "refCustId" FROM public.customers
//     WHERE "refCode" = $1
//     ORDER BY "refCustomerId" DESC
//     LIMIT 1;
// `;
export const getLastCustomerRefIdQuery = `
    SELECT
  cu."refCustId"
FROM
  public.customers cu
WHERE
  cu."refCode" = $1
ORDER BY
  cu."refCustomerId" DESC
LIMIT
  1;
`;

export const getCustomerCount = `
  SELECT COUNT(*) FROM public."customers"
`;

export const insertCustomerQuery = `
    INSERT INTO public."customers" ("refCustId", "refCustomerName", "refCode","refNotes", "refCustomerType", "refAddress", "refPhone")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
`;

export const updateCustomerQuery = `UPDATE
  public.customers 
SET
  "refCustId" = $1,
  "refCustomerName" = $2,
  "refCode" = $3,
  "refNotes" = $4,
  "refCustomerType" = $5,
  "refAddress" = $6,
  "refPhone" = $7
WHERE
  "refCustomerId" = $8
RETURNING
  *;`;

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

export const getCUstomersQuery = `SELECT * FROM public."customers"`;

export const customerSoftDeleteQuery = `UPDATE public."customers" SET "deletedAt" = NOW(), "deletedBy" = 'Admin'
WHERE "refCustomerId" = $1;`;

export const addPriceDetailsQuery = `INSERT INTO public."pricing"
  ("partnersId", "minWeight", "maxWeight", "price", "weightORdimension", "refLength","refBreadth", "refHeight", "calculation", "answer") 
  VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
  RETURNING *;`;

export const getPriceQuery = `SELECT *
FROM "pricing" pr
LEFT JOIN "partners" pa ON pr."partnersId" = pa."partnersId"
`;

export const insertCategoryQuery = `
INSERT INTO public."refCategoryTable" ("refCategory") 
VALUES ($1) RETURNING *;`;

export const getAllCategoriesQuery = `
  SELECT * FROM public."refCategoryTable";`;

export const insertSubcategoryQuery = `
  INSERT INTO public."refSubcategoryTable" ("refCategoryId", "refSubCategory") 
  VALUES ($1, $2) RETURNING *;`;

export const getAllSubcategoriesQuery = `
  SELECT
  rsc.*,
  rc.*
FROM
  public."refSubcategoryTable" rsc
  JOIN "refCategoryTable" as rc ON rsc."refCategoryId" = rc."refCategoryId";`;
