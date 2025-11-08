const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const usersFile = './users.json';
const todosFile = './todos.json';

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  writeJSON(usersFile, users);
  res.json({ message: 'Signup successful' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
});

// Get Todos
app.get('/todos/:username', (req, res) => {
  const todos = readJSON(todosFile);
  res.json(todos[req.params.username] || []);
});

// Add Todo
app.post('/todos/:username', (req, res) => {
  const todos = readJSON(todosFile);
  const { text } = req.body;

  if (!todos[req.params.username]) {
    todos[req.params.username] = [];
  }

  todos[req.params.username].push({ text, completed: false });
  writeJSON(todosFile, todos);
  res.json({ message: 'Task added' });
});

// Update Todo
app.put('/todos/:username/:index', (req, res) => {
  const todos = readJSON(todosFile);
  const { username, index } = req.params;
  const { text, completed } = req.body;

  if (todos[username] && todos[username][index]) {
    if (text !== undefined) todos[username][index].text = text;
    if (completed !== undefined) todos[username][index].completed = completed;
    writeJSON(todosFile, todos);
  }

  res.json({ message: 'Task updated' });
});

// Delete Todo
app.delete('/todos/:username/:index', (req, res) => {
  const todos = readJSON(todosFile);
  const { username, index } = req.params;

  if (todos[username]) {
    todos[username].splice(index, 1);
    writeJSON(todosFile, todos);
  }

  res.json({ message: 'Task deleted' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
