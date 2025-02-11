export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

  export const addParcelBookingQuery = `
  INSERT INTO public.parcelbooking
  (
    "partnersId", "type", "origin", "destination", "consignorName",
    "consignorAddress", "consignorGSTnumber", "consignorPhone", "consignorEmail",
    "customerRefNo", "consigneeName", "consigneeAddress", "consigneeGSTnumber",
    "consigneePhone", "consigneeEmail", "contentSpecification", "paperEnclosed",
    "declaredValue", "NoOfPieces", "actualWeight", "dimension",
    "height", "weight", "breadth", "chargedWeight"
  ) 
 VALUES 
  (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16, $17, $18, $19, $20,
    $21, $22, $23, $24, $25
  )
  RETURNING *;`;

  export const fetchParcelBookingData = `SELECT * FROM public.parcelbooking WHERE "parcelBookingId" = $1;`;