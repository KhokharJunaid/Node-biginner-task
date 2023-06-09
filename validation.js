const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required(),
  });

  const validation = schema.validate(data);
  return validation;
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required(),
  });

  const validation = schema.validate(data);
  return validation;
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
