import Joi from "joi";
import mongoose from "mongoose";

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId Validation");

export const validateCreateProposal = (data) => {
  const schema = Joi.object({
    clientId: objectId.required(),

    salesExecutive: objectId.optional(),

    clientName: Joi.string().trim().required(),
    clientCompany: Joi.string().trim().required(),
    clientAddress: Joi.string().trim().required(),

    GSTIN: Joi.string()
      .length(15)
      .uppercase()
      .pattern(/^[0-9A-Z]{15}$/)
      .required(),

    tanNo: Joi.string().optional().allow(""),

    services: Joi.array().items(objectId).optional(),

    discount: Joi.number().min(0).optional(),
    discountPercentage: Joi.number().min(0).max(100).optional(),
    totalAmount: Joi.number().min(0).optional(),

    validTill: Joi.date().optional(),
    dateOfProposal: Joi.date().required(),
    paymentMethod: Joi.string().optional(),
    notes: Joi.string().optional().allow(""),

    partlyPayment: Joi.array()
      .items(
        Joi.object({
          paymentDuration: Joi.string().required(),
          paymentAmount: Joi.number().min(0).required(),
        }),
      )
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};
