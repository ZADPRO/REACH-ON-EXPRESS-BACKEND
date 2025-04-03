import * as Joi from "joi";

export default {
  parcelBooking: {
    payload: Joi.object({
      partnersName: Joi.string().required(),
      type: Joi.string().required(),
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      consignorName: Joi.string().required(),
      consignorAddress: Joi.string().required(),
      consignorGSTnumber: Joi.string().required(),
      consignorPhone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),
      consignorEmail: Joi.string().email().required(),
      customerRefNo: Joi.string().required(),
      consigneeName: Joi.string().required(),
      consigneeAddress: Joi.string().required(),
      consigneeGSTnumber: Joi.string().required(),
      consigneePhone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),
      consigneeEmail: Joi.string().email().required(),
      contentSpecification: Joi.string().required(),
      paperEnclosed: Joi.string().required(),
      declaredValue: Joi.string().required(),
      NoOfPieces: Joi.string().required(),
      actualWeight: Joi.string().required(),
      dimension: Joi.boolean().required(),
      height: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      weight: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      breadth: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      chargedWeight: Joi.string().required(),
      paymentId: Joi.number().integer().required(),
      customerType: Joi.boolean().required(),
      refCustomerId: Joi.number().integer().positive().required(),
      netAmount: Joi.number().integer().required(),
      pickUP: Joi.string().required(),
      count: Joi.number().integer().required(),
      consignorPincode: Joi.number().integer().required(),
      consigneePincode: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  updateBooking: {
    payload: Joi.object({
      partnersName: Joi.string().required(),
      type: Joi.string().required(),
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      consignorName: Joi.string().required(),
      consignorAddress: Joi.string().required(),
      consignorGSTnumber: Joi.string().required(),
      consignorPhone: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
      consignorEmail: Joi.string().email().required(),
      customerRefNo: Joi.string().required(),
      consigneeName: Joi.string().required(),
      consigneeAddress: Joi.string().required(),
      consigneeGSTnumber: Joi.string().required(),
      consigneePhone: Joi.string()
        .pattern(/^\d{10}$/)
        .required(),
      consigneeEmail: Joi.string().email().required(),
      contentSpecification: Joi.string().required(),
      paperEnclosed: Joi.string().required(),
      declaredValue: Joi.string().required(),
      NoOfPieces: Joi.string().required(),
      actualWeight: Joi.string().required(),
      dimension: Joi.boolean().required(),
      height: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.allow(null),
      }),
      weight: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.allow(null),
      }),
      breadth: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.allow(null),
      }),
      chargedWeight: Joi.when("dimension", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.allow(null),
      }),
      paymentId: Joi.number().integer().required(),
      customerType: Joi.boolean().required(),
      refCustomerId: Joi.number().integer().required(),
      netAmount: Joi.number().integer().required(),
      pickUP: Joi.string().required(),
      count: Joi.number().integer().required(),
      consignorPincode: Joi.number().integer().required(),
      consigneePincode: Joi.number().integer().required(),
      parcelBookingId: Joi.number().integer().required(),
      isRefParcel: Joi.boolean().required(),
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  },
  viewBooking:{
    payload: Joi.object({
      parcelBookingId: Joi.number().integer().required()
    }),
    headers: Joi.object({
      authorization: Joi.string().optional(),
    }).unknown(),
  }
};
