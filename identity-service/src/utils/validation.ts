import Joi from "joi";
import { IUser } from "../modals/userModal";

export const validateRegistration = (data: Partial<IUser>) => {
  const Schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return Schema.validate(data);
};
export const validateLogin = (data: Partial<IUser>) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return Schema.validate(data);
};