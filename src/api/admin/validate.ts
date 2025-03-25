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
};
