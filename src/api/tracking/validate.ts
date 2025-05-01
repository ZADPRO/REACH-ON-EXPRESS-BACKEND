import * as Joi from "joi";

export default {
  tracking: {
    payload: Joi.object({
      consignmentNumber: Joi.string()
        .optional()
        .when("referenceNumber", { is: Joi.exist(), then: Joi.forbidden() }),

      referenceNumber: Joi.string()
        .optional()
        .when("consignmentNumber", { is: Joi.exist(), then: Joi.forbidden() }),
    }).or("consignmentNumber", "referenceNumber"),
    
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
};
