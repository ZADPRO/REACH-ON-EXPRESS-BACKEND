export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const checkQuery = `SELECT * FROM public."refusersdomain" WHERE "refUsername"=$1 LIMIT 10;`;
export const insertUserQuery = `INSERT INTO public."user" ( "refUserFName", "refUserLName") 
VALUES ($1, $2) RETURNING *;`;
export const insertUserDomainQuery = `INSERT INTO public."refusersdomain" (
"refUserId", "refCustMobileNum","refCustpassword", "refCusthashedpassword", "refUsername" )
VALUES ($1, $2,$3, $4, $5)
RETURNING *;`;
export const insertUserCommunicationQuery = `INSERT INTO public."refCommunication" (
"refUserId", "refMobileNo", "refEmail") VALUES ($1, $2, $3)
RETURNING *;`;

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

export const addVendorQuery = `INSERT INTO public."customers" ("refUserId", "refCustomerName", "refCode", "refNotes", "refCustomerType")
VALUES ($1, $2, $3, $4, $5)
RETURNING *;`;

export const updateVendorQuery = ``;

export const getVendorQuery = `SELECT "refCustomerName","refUserId", "refCode", "refNotes", "refCustomerType" FROM Public."customers" 
WHERE "refCustomerId" = $1;`;

export const deleteVendorQuery = ``;