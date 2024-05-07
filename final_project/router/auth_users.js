const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    if (username) {
        return users.filter(user => user.username === username) ? true : false;
    }
    return false;
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;

    if (!isValid(username)) {
        return res.status(401).json({ message: "User not found or not logged in." });
    }

    const isbn = req.params.isbn;
    let book = {};
    Object.keys(books).forEach(k => k === isbn ? book = books[k] : [])
    if (book) {
        let review = req.body.review;

        if (!review) {
            return res.status(404).json({ message: "Review must not be empty." });
        }

        // get current reviews
        const currentReviews = book.reviews;
        currentReviews[username] = review;
      
        book.reviews = currentReviews;
        return res.status(200).json({ message: `Review added to "${book.title}" book by "${username}".` });
    }
    else {
        return res.status(404).json({ message: "Book not found." });
    }
});

// Delete a book review
regd_users.delete("/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;

    if (!isValid(username)) {
        return res.status(401).send("User not found or not logged in.");
    }

    const isbn = req.params.isbn;
    let book = {};
    Object.keys(books).forEach(k => k === isbn ? book = books[k] : [])
    if (book) {
        // get current reviews
        const currentReviews = book.reviews;
        delete currentReviews[username]
      
        book.reviews = currentReviews;
        return res.status(200).json({ message: `Review deleted.` });
    }
    else {
        return res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
