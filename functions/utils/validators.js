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

exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    // https://website.com
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
};
