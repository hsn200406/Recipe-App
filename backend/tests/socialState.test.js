const test = require("node:test");
const assert = require("node:assert/strict");
const { toggleId, updateCounter } = require("../utils/socialState");

test("toggleId adds missing ids", () => {
  assert.deepEqual(toggleId(["a"], "b"), {
    list: ["a", "b"],
    active: true,
  });
});

test("toggleId removes existing ids", () => {
  assert.deepEqual(toggleId(["a", "b"], "b"), {
    list: ["a"],
    active: false,
  });
});

test("updateCounter increments and never decrements below zero", () => {
  assert.equal(updateCounter(3, true), 4);
  assert.equal(updateCounter(3, false), 2);
  assert.equal(updateCounter(0, false), 0);
});
