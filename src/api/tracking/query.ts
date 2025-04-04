export const GetConsignmentNumberQuery = `SELECT
  "parcelBookingId",
  "vendorLeaf"
FROM
  public."parcelbooking"
WHERE
  "vendorLeaf" = $1;

`;

export const GetReferenceNumberQuery = `SELECT
  "parcelBookingId",
  "vendorLeaf",
  "customerRefNo",
  "refCustId"
FROM
  public."parcelbooking"
WHERE
  "refCustId" = $1
  OR "customerRefNo" = $1;
`;