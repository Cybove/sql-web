const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

const authRoutes = require('./routes/auth');
const sqlRoutes = require('./routes/sql');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/html/login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/html/register.html'));
});
app.get('/sql', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/html/sql.html'));
});


app.use('/api/auth', authRoutes);
app.use('/sql', sqlRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
