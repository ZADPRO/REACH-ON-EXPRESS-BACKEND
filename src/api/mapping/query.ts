export const updateHistoryQuery = `
 INSERT INTO public."reftxnhistory" ("transtypeId", "refUserId", "transdata", "transtime", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const getPartnerValidityQuery = `
  SELECT "validity" FROM public."partners" WHERE "partnersId" = $1;
`;

export const insertTransactionMappingQuery = (rowCount: number) => {
    const valuesPlaceholder = [];
    for (let i = 0; i < rowCount; i++) {
        valuesPlaceholder.push(`($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`);
    }

    return `
        INSERT INTO public."transactionmapping" 
        ("refStatus", "partnersId", "leaf", "purchasedDate", "validityDate")
        VALUES ${valuesPlaceholder.join(", ")}
        RETURNING *;
    `;
};

// export const GetUserRefCustIdQuery = `SELECT refCustId FROM users WHERE id = $1;`;

// export const GetPartnerValidityQuery = `SELECT validity FROM partners WHERE id = $1;`;



export const transactionMappingQuery = `  SELECT 
    t.leaf AS "vendorLeaf",
    p."partnersName" AS "vendor",
    r."refStatusName" AS "status",
    t."purchasedDate",
    p."validity"
  FROM "transactionmapping" t
  LEFT JOIN "partners" p ON t."partnersId" = p."partnersId"
  LEFT JOIN "refStatus" r ON t."refStatusId" = r."refStatusId"
  WHERE t."leaf" = $1;`;