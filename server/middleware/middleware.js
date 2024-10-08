import jwt from "jsonwebtoken";
import userModel from "../models/.js";
export async function auth(req, res, callback) {
  try {
    const token = req.headers.authorization.split("")[1];
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    callback();
  } catch (err) {
    res.status(401).send(err);
    return;
  }
}

export async function verifyUser(req, res, callback) {
  try {
    const { username } = req.method === "Get" ? req.query : req.body;
    let isUsernameExist = await userModel.findOne({ username });
    if (!isUsernameExist)
      return res.status(404).send({ error: "error username not found" });
    callback();
  } catch (error) {
    res.status(404).send(error);
  }
}
// Local Variables
export async function localVariables(req, res, callback) {
  try {
    // Set Local Variables into request's app.locals
    const localData = {
      OTP: null,
      resetSession: false,
    };
    req.app.locals = localData;
    callback();
  } catch (err) {
    return res.status(401).send(err);
  }
}
