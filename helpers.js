function findByEmail(email, database) {
  let user;
  for (const key in database) {
    if (Object.hasOwnProperty.call(database, key)) {
      const element = database[key];
      if (element.email === email.trim()) {
        user = element;
      }
    }
  }
  return user;
}

module.exports = {
  findByEmail,
};
