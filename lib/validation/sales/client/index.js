import Joi from "joi";
import mongoose from "mongoose";

// ObjectId validator for Joi
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid salesExecutive id");
  }
  return value;
});

export const validateClient = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    company: Joi.string().trim().required(),
    tanNo: Joi.string().required().allow(""),
    email: Joi.string().email().required(),
    GSTIN: Joi.string()
      .length(15)
      .uppercase()
      .pattern(/^[0-9A-Z]{15}$/)
      .required(),
    phone: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    website: Joi.string().uri().required().allow(""),
    Address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().required(),
    meetingDate: Joi.string().allow("").optional(),
    salesExecutive: objectId.required(),
    notes: Joi.string().allow("").optional(),
  });

  return schema.validate(data, {
    abortEarly: false, // return all errors
  });
};
