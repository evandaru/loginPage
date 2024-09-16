const express = require('express');
const postgres = require('postgres');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = 5001

app.use(cors());
app.use(cors({
    origin: '*'
}));


const connectionString = "postgresql://postgres.heafwwqjgzyfezrmzqqn:Z5y66U4H76lNwZVC@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
const sql = postgres(connectionString);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to check for API key


// Hash a password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, "sapi", { expiresIn: '1h' });
};



// Example route to create a new user (Register)
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password); // Hash the password
        const result = await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword}) RETURNING *`;
        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Sign Up route (Pendaftaran user baru)
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash password sebelum menyimpan ke database
        const hashedPassword = await hashPassword(password);
        // Cek apakah email sudah terdaftar
        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Simpan pengguna baru ke database
        const result = await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword}) RETURNING *`;
        res.status(201).json({ message: 'User registered successfully', user: result[0] });
    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk melihat total user
app.get('/users/count', async (req, res) => {
    try {
        const result = await sql`SELECT COUNT(*) FROM users`;
        const totalUsers = result[0].count;
        res.json({ totalUsers });
    } catch (err) {
        console.error('Error fetching user count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Middleware to authenticate the JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer TOKEN'

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, "sapi", (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid Token' });
        }
        req.user = user; // Add the user data to the request object
        next();
    });
};

// Example protected route
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
