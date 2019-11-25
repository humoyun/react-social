const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isEmpty = str => str.trim() === "";
const isValidEmail = email => !regEx.test(email.trim());

const validateSignUpData = newUser => {
  let errors = {};

  if (isEmpty(newUser.email)) errors.email = "Email must not be empty";
  else if (isValidEmail(newUser.email))
    errors.email = "Must a valid email address";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";
  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmedPassword)
    errors.newUser = "Passwords must match";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

const validateLoginData = user => {
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Email must not be empty";
  if (isEmpty(user.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

module.exports = { validateLoginData, validateSignUpData };
