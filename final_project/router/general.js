const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username ) {
        return res.status(404).json({message: "Username empty."});
    }

    if (!password ) {
        return res.status(404).json({message: "Password empty."});
    }
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: `${username} successfully registred.`});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    let getBooksPromise = new Promise((resolve, reject) => {
        try {
            resolve(books)
        } catch(error) {
            console.log(error)
            reject(error)
        }
    })
    return getBooksPromise
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).json({message: error}));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let book = {};

    let getBookPromise = new Promise((resolve, reject) => {
        try {
            Object.keys(books).forEach(k => k === isbn ? book = books[k] : [])
            resolve(book)
        } catch(error) {
            console.log(error)
            reject(error)
        }
    })
    return getBookPromise
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).json({message: error}));
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];
    let getBookByAuthorPromise = new Promise((resolve, reject) => {
        try {
            Object.keys(books).forEach(k => books[k].author.toLowerCase() === author.toLowerCase() ? booksByAuthor.push({[k]: books[k]}) : [])
            resolve(booksByAuthor)
        } catch(error) {
            console.log(error)
            reject(error)
        }
    })
    return getBookByAuthorPromise
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).json({message: error}));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let booksByTitle = [];
    let getBookByTitlePromise = new Promise((resolve, reject) => {
        try {
            Object.keys(books).forEach(k => books[k].title.toLowerCase() === title.toLowerCase() || books[k].title.toLowerCase().includes(title.toLowerCase()) ? booksByTitle.push({[k]: books[k]}) : [])
            resolve(booksByTitle)
        } catch(error) {
            console.log(error)
            reject(error)
        }
    })
    return getBookByTitlePromise
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).json({message: error}));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let reviews = {};
    Object.keys(books).forEach(k => k === isbn ? reviews = books[k].reviews : [])
    return res.status(200).json(reviews);
});

module.exports.general = public_users;
