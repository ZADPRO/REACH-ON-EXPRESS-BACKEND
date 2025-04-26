export const getUnpaidEmployeeList = `SELECT *
FROM public.user u
WHERE u."refUserId" NOT IN (
  SELECT sa."refEmployeId"
  FROM public."refSalaryAudit" sa
  WHERE sa."refSalaryMonth" = $1
);`;

export const insertSalaryData = `INSERT INTO public."refSalaryAudit" (
    "refEmployeId",
    "refBasicSalary",
    "refPf",
    "refPaidAmt",
    "refPaidDate",
    "refSalaryMonth",
    "refCreatedAt",
    "refCreatedBy"
  )
  SELECT 
    u."refUserId",
    u.salary,
    CAST(u."pfDeduction" AS INTEGER),
    ROUND(
      (CAST(u.salary AS NUMERIC) - ((CAST(u.salary AS NUMERIC) / 100) * CAST(u."pfDeduction" AS NUMERIC))),
      2
    )::TEXT,
    $2,
    $3,
    $2,
    $4
  FROM public."user" u
  WHERE u."refUserId" = ANY($1::int[]);
  `;

export const getPayedList = `SELECT *
  FROM public."user" u
  WHERE u."refUserId" IN (
    SELECT sa."refEmployeId"
    FROM public."refSalaryAudit" sa
    WHERE sa."refSalaryMonth" = $1
  )
  ORDER BY u."refUserId"`;
