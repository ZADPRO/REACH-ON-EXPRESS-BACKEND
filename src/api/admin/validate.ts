import * as Joi from "joi";

export default {
  userLogin: {
    payload: Joi.object({
      login: Joi.string().required(),
      password: Joi.string().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },

  addEmployee: {
    payload: Joi.object({
      temp_fname: Joi.string().required(),
      temp_lname: Joi.string().required(),
      designation: Joi.string().required(),
      userType: Joi.number().integer().required(),
      dateOfBirth: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      qualification: Joi.string().required(),
      temp_phone: Joi.string()
        .pattern(/^\d{10}$/) // Ensures a 10-digit phone number
        .required(),
      temp_email: Joi.string().email().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },

  viewProfile: {
    payload: Joi.object({
      refUserId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
      // instituteUrl: Joi.string().required(),
    }).unknown(),
  },
  addPartners: {
    payload: Joi.object({
      partnersName: Joi.string().required(),
      validityDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      mobileNumber: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  updatePartners: {
    payload: Joi.object({
      partnersName: Joi.string().required(),
      phoneNumber: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
      validity: Joi.string().required(),
      partnerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  getPartners: {
    payload: Joi.object({
      partnerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  deletePartners: {
    payload: Joi.object({
      partnerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  addCustomer: {
    payload: Joi.object({
      customerName: Joi.string().required(),
      customerCode: Joi.string().required(),
      customerType: Joi.boolean().required(),
      notes: Joi.string().required(),
      refAddress: Joi.string().required(),
      refPhone: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  updateCustomer: {
    payload: Joi.object({
      customerName: Joi.string().required(),
      customerCode: Joi.string().required(),
      notes: Joi.string().required(),
      customerType: Joi.boolean().required(),
      refAddress: Joi.string().required(),
      refPhone: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
      refCustomerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  getCustomer: {
    payload: Joi.object({
      refCustomerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  deleteCustomer: {
    payload: Joi.object({
      refCustomerId: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  addPricing: {
    payload: Joi.object({
      partnersId: Joi.number().integer().required(),
      minWeight: Joi.string().required(),
      maxWeight:Joi.string().required(),
      price: Joi.string().required(),
      dimension: Joi.boolean().optional(),
      length: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      breadth: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      height: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      calculation: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      answer: Joi.string().optional(),
    }),

    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  addCategory:{
    payload: Joi.object({
      category: Joi.string().required()
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  addSubCategory:{
    payload: Joi.object({
      categoryId: Joi.number().integer().required(),
      subcategory: Joi.string().required()
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  }

};
