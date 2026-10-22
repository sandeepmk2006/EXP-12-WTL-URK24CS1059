require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017');

app.use(cors());
app.use(express.json());

let students;

function validate(body) {
    const { regNo, name, department } = body;
    if ([regNo, name, department].some(v => typeof v !== 'string' || !v.trim())) {
        return null;
    }
    return {
        regNo: regNo.trim().toUpperCase(),
        name: name.trim(),
        department: department.trim().toUpperCase()
    };
}

app.get('/api/students', async (req, res) => {
    try {
        const filter = {};
        if (req.query.department) {
            filter.department = String(req.query.department).trim().toUpperCase();
        }
        const records = await students.find(filter).toArray();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch students' });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const student = validate(req.body);
        if (!student) {
            return res.status(400).json({
                error: 'Register number, name and department are required'
            });
        }

        const result = await students.insertOne(student);
        res.status(201).json({
            _id: result.insertedId,
            ...student,
            message: 'Student added successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add student' });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        const student = validate(req.body);
        if (!student) {
            return res.status(400).json({
                error: 'Register number, name and department are required'
            });
        }

        const result = await students.updateOne(
            { _id: new ObjectId(id) },
            { $set: student }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update student' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        const result = await students.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete student' });
    }
});

async function startServer() {
    try {
        await client.connect();

        const db = client.db('CollegeDB');
        students = db.collection('Students');

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Backend running on port ${port}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
