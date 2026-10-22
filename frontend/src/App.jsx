import { useEffect, useState } from 'react';
import './App.css';
import {
    addStudent,
    deleteStudent,
    isOffline,
    listStudents,
    updateStudent
} from './api.js';

const empty = { regNo: '', name: '', department: '' };

function App() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');

    async function loadStudents(department = search) {
        try {
            setStudents(await listStudents(department));
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadStudents('');
    }, []);

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    function resetForm() {
        setForm(empty);
        setEditId(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');

        try {
            const data = editId
                ? await updateStudent(editId, form)
                : await addStudent(form);
            resetForm();
            setMessage(data.message);
            await loadStudents();
        } catch (error) {
            setMessage(error.message || 'Request failed');
        }
    }

    function editStudent(student) {
        setEditId(student._id);
        setForm({
            regNo: student.regNo,
            name: student.name,
            department: student.department
        });
        setMessage('');
    }

    async function removeStudent(id) {
        if (!window.confirm('Delete this student?')) return;

        try {
            const data = await deleteStudent(id);
            setMessage(data.message);
            await loadStudents();
        } catch (error) {
            setMessage(error.message);
        }
    }

    function handleSearch(event) {
        event.preventDefault();
        loadStudents(search);
    }

    function clearSearch() {
        setSearch('');
        loadStudents('');
    }

    return (
        <main className="container">
            <h1>Student Management System</h1>
            <p className="subtitle">
                Frontend: React.js · Backend: Node.js + Express.js · Database: MongoDB
            </p>
            {isOffline() && (
                <p className="notice">
                    Backend not reachable, running in demo mode (records are saved in this browser).
                </p>
            )}

            <section className="card">
                <h2>{editId ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        name="regNo"
                        placeholder="Register Number"
                        value={form.regNo}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="name"
                        placeholder="Student Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="department"
                        placeholder="Department"
                        value={form.department}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="primary">
                        {editId ? 'Update Student' : 'Add Student'}
                    </button>
                    {editId && (
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </form>
                {message && <p role="status" className="status">{message}</p>}
            </section>

            <section className="card">
                <h2>Student Records</h2>
                <form onSubmit={handleSearch}>
                    <input
                        placeholder="Search by Department"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit" className="primary">Search</button>
                    <button type="button" onClick={clearSearch}>Show All</button>
                </form>

                <table>
                    <thead>
                        <tr>
                            <th>Register No</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="empty">No student records found</td>
                            </tr>
                        )}
                        {students.map(student => (
                            <tr key={student._id}>
                                <td>{student.regNo}</td>
                                <td>{student.name}</td>
                                <td>{student.department}</td>
                                <td>
                                    <button onClick={() => editStudent(student)}>Edit</button>
                                    <button
                                        className="danger"
                                        onClick={() => removeStudent(student._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}

export default App;
