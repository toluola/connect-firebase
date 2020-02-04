const { isEmail, isEmpty } = require("./helpers");

exports.validateSignup = newUser => {
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Password must not be empty";

  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Password must match";

  if (isEmpty(newUser.handle)) errors.handle = "Handle must not be empty";

  if (Object.keys(errors).length > 0) {
    return errors;
  }
};

exports.validateLogin = user => {
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Email must not be empty";
  if (isEmpty(user.password)) errors.password = "Password must not be empty";

  if (Object.keys(errors).length > 0) return errors;
};
