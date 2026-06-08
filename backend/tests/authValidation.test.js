const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isValidEmailSyntax,
  isValidHandle,
  normalizeLoginInput,
  normalizeRegisterInput,
  validateRegisterInput,
} = require("../utils/authValidation");

test("normalizeRegisterInput trims and lowercases user-facing identity fields", () => {
  assert.deepEqual(
    normalizeRegisterInput({
      name: "  Hassan Ghayaty  ",
      handle: "  Hassan_Cooks ",
      email: "  HASSAN@EXAMPLE.COM ",
      password: "password123",
    }),
    {
      name: "Hassan Ghayaty",
      handle: "hassan_cooks",
      email: "hassan@example.com",
      password: "password123",
    },
  );
});

test("normalizeLoginInput trims and lowercases email only", () => {
  assert.deepEqual(
    normalizeLoginInput({
      email: "  USER@Example.COM ",
      password: " Secret123 ",
    }),
    {
      email: "user@example.com",
      password: " Secret123 ",
    },
  );
});

test("isValidHandle accepts only app-safe handles", () => {
  assert.equal(isValidHandle("chef_123"), true);
  assert.equal(isValidHandle("ab"), false);
  assert.equal(isValidHandle("bad handle"), false);
  assert.equal(isValidHandle("bad!"), false);
});

test("isValidEmailSyntax rejects malformed emails", () => {
  assert.equal(isValidEmailSyntax("person@example.com"), true);
  assert.equal(isValidEmailSyntax("notemail"), false);
  assert.equal(isValidEmailSyntax("person@example"), false);
});

test("validateRegisterInput returns first useful validation message", () => {
  assert.equal(
    validateRegisterInput({
      name: "Hassan",
      handle: "hassan",
      email: "hassan@example.com",
      password: "password123",
    }),
    null,
  );

  assert.equal(
    validateRegisterInput({
      name: "A",
      handle: "bad handle!",
      email: "notemail",
      password: "123",
    }),
    "Name must be at least 5 characters",
  );
});
