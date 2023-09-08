const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Load environment variables from .env
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });


// Read the users data from 'users.json'
const usersData = JSON.parse(fs.readFileSync('./database/users.json', 'utf8'));
const users = usersData.users; // Access the 'users' array


// Route to render the registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Route to handle user registration
app.post('/register', upload.single('avatar'), (req, res) => {
  const { username, email, password } = req.body;
  const avatar = req.file ? req.file.filename : null; // Store the avatar filename

  // Store the user data (username, email, password, avatar) in 'users.json'
  const newUser = { username, email, password, avatar };
  users.push(newUser);

  // Save the updated 'users' array back to 'users.json'
  fs.writeFileSync('./database/users.json', JSON.stringify(usersData, null, 2));

  // Redirect to login page after registration
  res.redirect('/login');
});

// Route to render the login page
app.get('/login', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    // If the user is authenticated, redirect to the dashboard
    return res.redirect('/dashboard');
  }

  // If not authenticated, render the login form
  res.render('login');
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verify user credentials (email and password) from 'users.json'
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    // Generate a JWT token upon successful login
    const token = jwt.sign({ email: user.email, avatar: user.avatar }, process.env.JWT_SECRET, {
    });

    // Set the JWT token in a cookie
    res.cookie('token', token);

    // Redirect to the dashboard after successful login
    res.redirect('/dashboard');
  } else {
    res.send('Invalid email or password');
  }
});

// Route to render the dashboard
app.get('/dashboard', (req, res) => {
  // Verify the JWT token from the cookie
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }

    // If the token is valid, render the dashboard
    res.render('dashboard', { email: decoded.email, avatar: decoded.avatar });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
