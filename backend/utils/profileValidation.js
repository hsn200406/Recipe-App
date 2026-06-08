const { isValidHandle } = require("./authValidation");

function normalizeProfileInput(body = {}) {
  return {
    name: body.name?.trim(),
    handle: body.handle?.trim().toLowerCase(),
    bio: body.bio?.trim(),
    avatarColor: body.avatarColor,
    specialty: body.specialty?.trim(),
  };
}

function validateProfileInput({ name, handle, bio, specialty }) {
  if (name !== undefined && name.length < 5) {
    return "Name must be at least 5 characters";
  }

  if (handle !== undefined && !isValidHandle(handle)) {
    return "Handle must be 3-20 characters and use only letters, numbers, or underscores";
  }

  if (bio !== undefined && bio.length > 160) {
    return "Bio must be 160 characters or less";
  }

  if (specialty !== undefined && specialty.length > 40) {
    return "Specialty must be 40 characters or less";
  }

  return null;
}

function buildProfileUpdates({ name, handle, bio, avatarColor, specialty }) {
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (handle !== undefined) updates.handle = handle;
  if (bio !== undefined) updates.bio = bio;
  if (avatarColor !== undefined) updates.avatarColor = avatarColor;
  if (specialty !== undefined) updates.specialty = specialty;

  return updates;
}

module.exports = {
  normalizeProfileInput,
  validateProfileInput,
  buildProfileUpdates,
};
