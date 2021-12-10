const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { findByEmail } = require("./helpers");

const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
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
function redirectLogin(req, res, next) {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  next();
}
function authMiddleware(req, res, next) {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
}
function urlsForUser(id) {
  let response = {};
  let userUrls = Object.entries(urlDatabase)
    .filter((url) => {
      if (url[1].userID === id) {
        return true;
      }
      return false;
    })
    .forEach((url) => {
      response[url[0]] = url[1];
    });
  return response;
}
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["hfshdf"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    console.log(req.session.user_id);
    let userUrls = Object.entries(urlDatabase)
      .filter((url) => {
        if (url[1].userID === req.session.user_id) {
          return true;
        }
        return false;
      })
      .map((url) => {
        return { shortUrl: url[0], ...url[1] };
      });
    const templateVars = {
      urls: userUrls,
      user: users[req.session.user_id],
    };
    return res.render("urls_index", templateVars);
  }
  return res.send("please login to view your urls");
});

app.get("/urls/new", authMiddleware, (req, res) => {
  res.render("urls_new", { user: users[req.session.user_id] });
});

app.post("/urls", authMiddleware, (req, res) => {
  urlDatabase[generateRandomString()] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect("/urls");
});

app.get("/register", redirectLogin, (req, res) => {
  res.render("register", { user: users[req.session.user_id] });
});

app.get("/login", redirectLogin, (req, res) => {
  res.render("login", { user: users[req.session.user_id] });
});

app.post("/register", redirectLogin, (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    return res.status(400).send();
  }
  if (findByEmail(email, users)) {
    return res.status(400).send();
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userUrls = urlsForUser(req.session.user_id);
  if (!userUrls[shortURL]) {
    return res.send("please login to view your urls");
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userUrls = urlsForUser(req.session.user_id);
  if (!userUrls[shortURL]) {
    return res.send("please login to edit your urls");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", authMiddleware, (req, res) => {
  let shortURL = req.params.shortURL;
  let userUrls = urlsForUser(req.session.user_id);
  if (!userUrls[shortURL]) {
    return res.send("please login to delete your urls");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url) {
    return res.redirect(url.longURL);
  }
  res.send();
});

app.post("/login", redirectLogin, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findByEmail(email, users);
  if (!user) {
    return res.status(403).send();
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send();
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", authMiddleware, (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
