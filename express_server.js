const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
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
function generateRandomString() {
  return Date.now();
}
function findByEmail(email) {
  let user;
  for (const key in users) {
    if (Object.hasOwnProperty.call(users, key)) {
      const element = users[key];
      if (element.email === email.trim()) {
        user = element;
      }
    }
  }
  return user;
}
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
});
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  return res.redirect("/urls");
});
app.get("/register", (req, res) => {
  res.render("register", { user: users[req.cookies.user_id] });
});
app.get("/login", (req, res) => {
  res.render("login", { user: users[req.cookies.user_id] });
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    return res.status(400).send();
  }
  if (findByEmail(email)) {
    return res.status(400).send();
  }
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findByEmail(email);
  if (!user) {
    return res.status(403).send();
  }
  if (user.password !== password.trim()) {
    return res.status(403).send();
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
