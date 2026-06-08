function normalizeRegisterInput(body = {}) {
  return {
    name: body.name?.trim(),
    handle: body.handle?.trim().toLowerCase(),
    email: body.email?.trim().toLowerCase(),
    password: body.password,
  };
}

function normalizeLoginInput(body = {}) {
  return {
    email: body.email?.trim().toLowerCase(),
    password: body.password,
  };
}

function isValidHandle(handle) {
  return /^[a-z0-9_]{3,20}$/.test(handle || "");
}

function isValidEmailSyntax(email) {
  return /^\S+@\S+\.\S+$/.test(email || "");
}

function validateRegisterInput({ name, handle, email, password }) {
  if (!name || !handle || !email || !password) {
    return "Please fill in all required fields";
  }

  if (name.length < 5) {
    return "Name must be at least 5 characters";
  }

  if (!isValidHandle(handle)) {
    return "Handle must be 3-20 characters and use only letters, numbers, or underscores";
  }

  if (!isValidEmailSyntax(email)) {
    return "Please enter a valid email";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

module.exports = {
  normalizeRegisterInput,
  normalizeLoginInput,
  isValidHandle,
  isValidEmailSyntax,
  validateRegisterInput,
};
