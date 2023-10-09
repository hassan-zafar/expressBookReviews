const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = "fingerprint_customer";

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return users.some(u => u.username === username);

}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(u => u.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;


  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  users.find(u => u.username === username).token = token;
  console.log(users);
  return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = [];
    }

    const bookReviews = books[isbn].reviews;
    const userReview = Object.keys(bookReviews).find(r => r.username === username);
    if (userReview) {
      userReview.review = review;
    } else {
      books[isbn].reviews[username] = review;
    }
    console.log(books[isbn].reviews);
    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    books[isbn].reviews = Object.keys(books[isbn].reviews).find(r => r.username !== username);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
