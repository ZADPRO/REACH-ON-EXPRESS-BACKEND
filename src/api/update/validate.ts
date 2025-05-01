import * as Joi from "joi";

export default {
  updatePartners: {
    payload: Joi.object({
      partnersName: Joi.string().required(),
      phoneNumber: Joi.string().min(10).required(),
      validity: Joi.string().required(),
      partnerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },

  updateCustomers: {
    payload: Joi.object({
      refCustomerId: Joi.number().integer().required(),
      customerName: Joi.string().required(),
      customerCode: Joi.string().required(),
      notes: Joi.string().required(),
      customerType: Joi.boolean().required(),
      refAddress: Joi.string().required(),
      refPhone: Joi.string().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  updatePricing: {
    payload: Joi.object({
      pricingId: Joi.number().integer().required(),
      partnersId: Joi.number().integer().required(),
      minWeight: Joi.string().required(),
      maxWeight: Joi.string().required(),
      price: Joi.string().required(),
      dimension: Joi.boolean().required(),
      answer: Joi.string().required(),

      // Conditional dimension fields
      length: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.any().strip(),
      }),
      breadth: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.any().strip(),
      }),
      height: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.any().strip(),
      }),
      calculation: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.any().strip(),
      }),
    }),
  },

  deletePartners: {
    payload: Joi.object({
      partnerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  deleteCustomers: {
    payload: Joi.object({
      refCustomerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  deletePricing: {
    payload: Joi.object({
      pricingId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
};
