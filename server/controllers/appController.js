import userModel from "../models/userModel.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
export async function register(req, res) {
  try {
    const { username, password, email, profile } = req.body;
    const isUsernameExist = new Promise((resolve, reject) => {
      userModel
        .findOne({ username })
        .then((data) =>
          data ? reject({ error: "username already exists" }) : resolve()
        )
        .catch((err) => reject({ isUsernameExist: err }));
    });

    const isEmailExist = new Promise((resolve, reject) => {
      userModel
        .findOne({ email })
        .then((data) =>
          data ? reject({ error: "email already exists" }) : resolve()
        )
        .catch((err) => reject({ isEmailExist: err }));
    });

    Promise.all([isUsernameExist, isEmailExist])
      .then(() => {
        hashpassword(password)
          .then((hashpassword) => {
            const user = new userModel({
              username: username,
              password: hashpassword,
              email: email,
              profile: profile,
            });
            user
              .save()
              .then(() =>
                res.status(201).send({ msg: "User Registered Successfully." })
              )
              .catch(() =>
                res.status(500).send({ error: "User Registration Failed...!" })
              );
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      })
      .catch((err) => res.status(500).send(err));
  } catch (err) {
    return res.status(401).send(err);
  }
}

export async function login(req, res) {
  try {
    const { username } = req.body;
    userModel
      .findOne({ username })
      .then((data) => {
        comparePassword(password, data.password)
          .then(() => {
            //create jwt token
            const load = { userId: data._id, username: data.username };
            const expires = { expiresIn: "24h" };
            const token = jwt.sign(load, process.env.JWT_SECRET, expires);
            return res.status(200).send({
              msg: "login successfull",
              username: data.username,
              token: token,
            });
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      })
      .catch((err) => {
        res.status(500).send({ error: "username not found" });
      });
  } catch (err) {
    return res.status(401).send(err);
  }
}
export async function getUser(req, res) {
  try {
    const { username } = req.params;
    userModel
      .findOne({ username })
      .then((data) => {
        const { password, ...rest } = Object.assign({}, data.toJSON());
        return res.status(201).send(rest);
      })
      .catch((err) => res.status(501).send({ err: "username not found" }));
  } catch (err) {
    return res.status(401).send(err);
  }
}

export async function updateUser(req, res) {
  try {
    const { userId } = req.user;
    if (userId) {
      const newData = req.body;
      const { email } = newData;

      const isEmailExist = new Promise((resolve, reject) => {
        userModel
          .findOne({ email, _id: { $ne: userId } })
          .then((data) =>
            data ? reject({ error: "email already registered..!" }) : resolve()
          )
          .catch((err) => reject({ isEmailExistsError: err }));
      });
      isEmailExist
        .then(() => {
          userModel
            .updateOne({ _id: userId }, newData)
            .then((data) => res.status(201).send({ msg: "user data updated" }))
            .catch((err) =>
              res
                .status(500)
                .send({ error: "Could'nt Update the Profile...!", err })
            );
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else {
      return res.status(404).send({ error: "Invalid User Id...!" });
    }
  } catch (err) {
    return res.status(401).send(err);
  }
}
export async function generateOTP(req, res) {
  try {
    const OTP = otpGenerator.generate(6, {
      lowercase: false,
      uppercase: false,
      specialChars: false,
    });
    req.app.locals.OTP = OTP;
    res.status(201).send({ OTP: OTP });
  } catch (err) {
    res.status(401).send(err);
  }
}
export async function verifyOTP(req, res) {
  try {
    const { otp } = req.query;
    const generatedOTP = req.app.locals.OTP;
    if (parseInt(otp) == parseInt(generatedOTP)) {
      req.app.locals.OTP = null; // Resets the OTP
      req.app.locals.resetSession = true; // Starts the password reset session
      return res.status(201).send({ msg: "OTP Verifed Successfully" });
    } else {
      return res.status(400).send({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(401).send(err);
  }
}

export async function createResetSession(req, res) {
  try {
    if (req.app.locals.resetSession) {
      return res
        .status(201)
        .send({ msg: "Access granted!", flag: req.app.locals.resetSession });
    } else {
      return res.status(440).send({ error: "Session expired!" });
    }
  } catch (err) {
    res.status(401).send(err);
  }
}

export async function resetPassword(req, res) {
  if (!req.app.locals.resetSession)
    return res.status(440).send({ error: "Session expired!" });

  try {
    const { username, password } = req.body;
    userModel
      .findOne({ username })
      .then((data) => {
        hashPassword(password)
          .then((hashedPassword) => {
            userModel
              .updateOne(
                { username: data.username },
                { password: hashedPassword }
              )
              .then(() => {
                req.app.locals.resetSession = false;
                res.status(201).send({ msg: "Password Updated Successfully" });
              })
              .catch(() =>
                res.status(500).send({ error: "Password Updation Failed" })
              );
          })
          .catch((err) => res.stats(500).send(err));
      })
      .catch((err) => res.status(404).send({ error: "Username Not Found" }));
  } catch (err) {
    res.status(401).send(err);
  }
}

// Helper Functions
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    if (password) {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => resolve(hashedPassword))
        .catch((error) => reject({ error: "Unable to hash Password" }));
    } else {
      reject({ error: "Invalid Password" });
    }
  });
}

async function comparePassword(originalPass, hashedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(originalPass, hashedPassword)
      .then((isCorrect) =>
        isCorrect ? resolve() : reject({ error: "Password Doesn't Match" })
      )
      .catch((err) => reject({ error: "Password Comparision Failed" }));
  });
}
