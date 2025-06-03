const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = './data.json';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let contacts = [];
if (fs.existsSync(DATA_FILE)) {
    contacts = JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveContacts() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
}

function mergeSort(array) {
    if (array.length <= 1) return array;

    const mid = Math.floor(array.length / 2);
    const left = mergeSort(array.slice(0, mid));
    const right = mergeSort(array.slice(mid));

    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i].name.localeCompare(right[j].name, 'en', { sensitivity: 'base' }) <= 0) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
}

function getSortedContacts() {
    return mergeSort([...contacts]);
}

app.get('/contacts', (req, res) => {
    const sortedContacts = getSortedContacts();
    res.json(sortedContacts);
});

app.post('/contacts', (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Missing name or phone' });
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalizedPhone)) {
        return res.status(400).json({ error: 'Invalid Indian phone format' });
    }

    if (contacts.some(contact => contact.phone === normalizedPhone)) {
        return res.status(409).json({ error: 'Phone number already exists' });
    }

    const newContact = { name, phone: normalizedPhone };
    contacts.push(newContact);
    saveContacts();
    res.status(201).json(newContact);
});

app.delete('/contacts/:phone', (req, res) => {
    const normalizedPhone = req.params.phone.replace(/\D/g, '').slice(-10);
    const index = contacts.findIndex(c => c.phone === normalizedPhone);

    if (index === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    contacts.splice(index, 1);
    saveContacts();
    res.status(200).json({ message: 'Contact deleted' });
});

app.get('/search', (req, res) => {
    const { query, by } = req.query;
    if (!query || !by) {
        return res.status(400).json({ error: 'Missing query or search type' });
    }

    const filtered = contacts.filter(contact =>
        contact[by].toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
