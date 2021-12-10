const { assert, expect } = require("chai");

const { findByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    expect(user.id).to.equal(expectedUserID);
  });
  it("should not return a user with an invalid email", function () {
    const user = findByEmail("fjhhfrh@example.com", testUsers);
    // Write your assert statement here
    expect(user).to.equal(undefined);
  });
});
