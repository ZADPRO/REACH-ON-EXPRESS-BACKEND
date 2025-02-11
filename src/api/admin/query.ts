export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const getLastEmployeeIdQuery = `
SELECT
  COUNT(*)
FROM
  public."user" u
WHERE
  u."refCustId" LIKE 'R-EMP-%'
  `;

  export const getLastCustomerIdQuery = `
  SELECT
    COUNT(*)
  FROM
    public."user" u
  WHERE
    u."refCustId" LIKE 'R-UNIQ-%'
    `;

export const checkQuery = `SELECT * FROM public."refusersdomain" WHERE "refUsername"=$1 LIMIT 10;`;
export const insertUserQuery = `INSERT INTO public."user" ( "refUserFName", "refUserLName", "designation", "userTypeId", "refCustId") 
VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
export const insertUserDomainQuery = `INSERT INTO public."refusersdomain" (
"refUserId", "refCustMobileNum","refCustpassword", "refCusthashedpassword", "refUsername" )
VALUES ($1, $2,$3, $4, $5)
RETURNING *;`;
export const insertUserCommunicationQuery = `INSERT INTO public."refCommunication" (
"refUserId", "refMobileNo", "refEmail") VALUES ($1, $2, $3)
RETURNING *;`;


// TESTING CODE

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

export const addPartnerQuery = `INSERT INTO public."partners" ("partnersName", "refUserId", "phoneNumber", "validityDate")
  VALUES ($1, $2, $3, $4)
  RETURNING *;`;

export const updatePartnerQuery = `UPDATE public."partners" SET "partnersName" = $1, "mobileNumber" = $2, "validityDate" = $3
  WHERE "partnersId" = $4 RETURNING *;`;

export const getPartnerQuery = `
   SELECT "partnersName","refUserId", "phoneNumber", "validityDate" FROM Public."partners" 
WHERE "partnersId" = $1;`;

export const deletePartnerQuery = `
   UPDATE public."partners" SET "partnersName" = '', "mobileNumber" = '', "validityDate" = ''
WHERE "partnersId" = $1 RETURNING *;`;

export const addCustomerQuery = `INSERT INTO public."customers" ("refUserId", "refCustomerName", "refCode", "refNotes", "refCustomerType")
VALUES ($1, $2, $3, $4, $5)
RETURNING *;`;

export const updateCustomerQuery = ``;

export const getCustomerQuery = `SELECT "refCustomerName","refUserId", "refCode", "refNotes", "refCustomerType" FROM Public."customers" 
WHERE "refCustomerId" = $1;`;

export const deleteCustomerQuery = ``;

export const addPriceDetailsQuery = `INSERT INTO public."pricing"
  ("partnersId", "refCustomerId", "minWeight", "maxWeight", "price", "weightORdimension", "refLength","refBreadth", "refHeight", "calculation", "answer") 
  VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
  RETURNING *;`;

export const insertCategoryQuery = `
INSERT INTO public."refCategoryTable" ("refCategory") 
VALUES ($1) RETURNING *;`;

export const getAllCategoriesQuery = `
  SELECT * FROM public."refCategoryTable";`;

export const insertSubcategoryQuery = `
  INSERT INTO public."refSubcategoryTable" ("refCategoryId", "refSubCategory") 
  VALUES ($1, $2) RETURNING *;`;

export const getAllSubcategoriesQuery = `
  SELECT * FROM public."refSubcategoryTable";`;

