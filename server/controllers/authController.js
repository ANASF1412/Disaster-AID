import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Log from "../models/Log.js";
import { successResponse, errorResponse } from "../utils/response.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const register = async (req, res) => {
  const { name, email, password, role, assignedCenter } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return errorResponse(res, "Email already registered", 409);

  const user = await User.create({ name, email, password, role, assignedCenter });
  const token = signToken(user);

  await Log.create({ action: "USER_REGISTER", user: user._id, metadata: { email, role } });

  return successResponse(
    res,
    { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    "Registration successful",
    201
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  const token = signToken(user);
  await Log.create({ action: "USER_LOGIN", user: user._id, metadata: { email } });

  return successResponse(
    res,
    { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    "Login successful"
  );
};
