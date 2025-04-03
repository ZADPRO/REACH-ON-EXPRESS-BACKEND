import * as Joi from "joi";

export default {
    AddTransactionMapping: { 
        payload: Joi.object({
            mappingData: Joi.array()
                .items(
                    Joi.object({
                        vendor: Joi.string().trim().min(1).max(255).required(),
                        vendorLeaf: Joi.string().min(1).max(255).required(),
                        purchasedDate: Joi.date().iso().required()
                    })
                )
                .min(1)
                .required()
        }),
        headers: Joi.object({
              authorization: Joi.string().optional(),
            }).unknown(),
    }
};
