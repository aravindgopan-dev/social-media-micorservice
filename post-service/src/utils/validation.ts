import Joi from "joi";
import { postInterface } from "../modals/post";
export const validateCreatePOst = (data:Partial<postInterface>) => {
  const Schema = Joi.object({
    content:Joi.string().min(3).max(5000).required()
  });

  return Schema.validate(data);
};

  