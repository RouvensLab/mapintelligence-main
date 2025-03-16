const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyBase@2005',
    database: 'ChatHistoryBase_v1'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Fetch all chats
app.get('/api/chats', (req, res) => {
    const sql = 'SELECT * FROM chats';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Fetch messages for a specific chat
app.get('/api/chats/:id/messages', (req, res) => {
    const sql = 'SELECT * FROM messages WHERE chat_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Create a new chat
app.post('/api/chats', (req, res) => {
    const sql = 'INSERT INTO chats (name) VALUES (?)';
    db.query(sql, [req.body.name], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, name: req.body.name });
    });
});

// Add a new message to a chat
app.post('/api/chats/:id/messages', (req, res) => {
    const sql = 'INSERT INTO messages (chat_id, message) VALUES (?, ?)';
    db.query(sql, [req.params.id, req.body.message], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, message: req.body.message });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
