import Joi from "joi";
import { postInterface } from "../modals/post";
export const validateCreatePOst = (data:Partial<postInterface>) => {
  const Schema = Joi.object({
    content:Joi.string().min(3).max(5000).required(),
    mediaId:Joi.array().items(Joi.string().length(24).optional())
  });

  return Schema.validate(data);
};

  