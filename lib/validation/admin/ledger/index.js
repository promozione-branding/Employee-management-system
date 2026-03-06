import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const ledgerValidationSchema = Joi.object({
  customerId: Joi.string().custom(objectId).required(),

  proposalIds: Joi.array().items(Joi.string().custom(objectId)),

  openingBalance: Joi.number().default(0),

  entries: Joi.array().items(
    Joi.object({
      proposalId: Joi.string().custom(objectId),

      date: Joi.date().required(),

      voucher: Joi.string().trim().required(),

      debit: Joi.number().min(0).default(0),

      credit: Joi.number().min(0).default(0),

      balance: Joi.number().default(0),

      particular: Joi.object({
        description: Joi.string().trim().required(),

        items: Joi.array().items(
          Joi.object({
            subDescription: Joi.string().trim().allow(""),
            price: Joi.number().required().default(0),
          })
        ),
      }).required(),

      chequeDetails: Joi.object({
        chequeNumber: Joi.string().trim().allow(""),
        chequeDate: Joi.date(),
        chequeAmount: Joi.number().default(0),
        accountNo: Joi.string().trim().allow(""),
        bankName: Joi.string().trim().allow(""),
        branchName: Joi.string().trim().allow(""),
        ifscCode: Joi.string()
          .uppercase()
          .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
          .message("Invalid IFSC Code"),
      }),

      net_banking: Joi.object({
        transactionId: Joi.string().trim().allow(""),
        transactionDate: Joi.date(),
        transactionAmount: Joi.number().default(0),
      }),

      upi: Joi.object({
        upi_id: Joi.string().trim().lowercase().allow(""),
        payerName: Joi.string().trim().allow(""),
        transactionId: Joi.string().trim().allow(""),
      }),

      credit_debit_card: Joi.object({
        card_type: Joi.string().valid("credit", "debit").default("credit"),
        cardLastNo: Joi.string().trim().allow(""),
        bankName: Joi.string().trim().allow(""),
        cardHolderName: Joi.string().trim().allow(""),
      }),
    })
  ),
});