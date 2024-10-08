import userModel from "../models/userModel";

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
