const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildProfileUpdates,
  normalizeProfileInput,
  validateProfileInput,
} = require("../utils/profileValidation");

test("normalizeProfileInput trims profile fields and lowercases handle", () => {
  assert.deepEqual(
    normalizeProfileInput({
      name: "  Test User  ",
      handle: "  TestChef ",
      bio: "  Loves quick meals.  ",
      specialty: "  High protein  ",
      avatarColor: "#FF5C3A",
    }),
    {
      name: "Test User",
      handle: "testchef",
      bio: "Loves quick meals.",
      specialty: "High protein",
      avatarColor: "#FF5C3A",
    },
  );
});

test("validateProfileInput enforces profile limits", () => {
  assert.equal(validateProfileInput({ name: "Test User" }), null);
  assert.equal(
    validateProfileInput({ name: "Joe" }),
    "Name must be at least 5 characters",
  );
  assert.equal(
    validateProfileInput({ bio: "x".repeat(161) }),
    "Bio must be 160 characters or less",
  );
  assert.equal(
    validateProfileInput({ specialty: "x".repeat(41) }),
    "Specialty must be 40 characters or less",
  );
});

test("buildProfileUpdates only includes submitted fields", () => {
  assert.deepEqual(
    buildProfileUpdates({
      name: "Test User",
      handle: undefined,
      bio: "",
      avatarColor: "#123456",
      specialty: undefined,
    }),
    {
      name: "Test User",
      bio: "",
      avatarColor: "#123456",
    },
  );
});
