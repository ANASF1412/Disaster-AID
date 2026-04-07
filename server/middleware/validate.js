import { errorResponse } from "../utils/response.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return errorResponse(res, message, 400);
  }
  next();
};

export default validate;
