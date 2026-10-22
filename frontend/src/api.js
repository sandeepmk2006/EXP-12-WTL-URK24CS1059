// Talks to the Express backend. When the backend is unreachable (for example on
// GitHub Pages, which only serves static files) it falls back to browser storage
// so the interface can still be demonstrated.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';
const KEY = 'students';

let offline = false;

function readLocal() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

function writeLocal(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        // storage unavailable: keep working without saving
    }
}

function clean({ regNo, name, department }) {
    if ([regNo, name, department].some(v => !v || !v.trim())) {
        throw new Error('Register number, name and department are required');
    }
    return {
        regNo: regNo.trim().toUpperCase(),
        name: name.trim(),
        department: department.trim().toUpperCase()
    };
}

async function request(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

const local = {
    list(department) {
        const list = readLocal();
        return department
            ? list.filter(s => s.department === department.trim().toUpperCase())
            : list;
    },
    add(student) {
        const record = { _id: Date.now().toString(36), ...clean(student) };
        writeLocal([...readLocal(), record]);
        return { ...record, message: 'Participant registered successfully' };
    },
    update(id, student) {
        const record = clean(student);
        writeLocal(readLocal().map(s => (s._id === id ? { ...s, ...record } : s)));
        return { message: 'Participant updated successfully' };
    },
    remove(id) {
        writeLocal(readLocal().filter(s => s._id !== id));
        return { message: 'Participant removed successfully' };
    }
};

const json = body => ({
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
});

export function isOffline() {
    return offline;
}

// Uses the backend while it is reachable; a network failure (TypeError from
// fetch) switches every later call to browser storage.
async function withFallback(remote, fallback) {
    if (!offline) {
        try {
            return await remote();
        } catch (error) {
            if (!(error instanceof TypeError)) throw error;
            offline = true;
        }
    }
    return fallback();
}

export async function listStudents(department = '') {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return withFallback(() => request(API + query), () => local.list(department));
}

export async function addStudent(student) {
    return withFallback(
        () => request(API, { method: 'POST', ...json(student) }),
        () => local.add(student)
    );
}

export async function updateStudent(id, student) {
    return withFallback(
        () => request(`${API}/${id}`, { method: 'PUT', ...json(student) }),
        () => local.update(id, student)
    );
}

export async function deleteStudent(id) {
    return withFallback(
        () => request(`${API}/${id}`, { method: 'DELETE' }),
        () => local.remove(id)
    );
}
