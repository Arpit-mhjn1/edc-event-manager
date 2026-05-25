const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// @route   POST /api/auth/register
// @desc    Register a new user (Student)
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, college_id, phone, department, course, branch, semester } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
        }

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password_hash, college_id, phone, department, course, branch, semester, role) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'STUDENT') RETURNING id, name, email, role`,
            [name, email, hashedPassword, college_id, phone, department || null, course || null, branch || null, semester || null]
        );

        const user = newUser.rows[0];

        // Generate token
        const token = generateToken({ id: user.id, role: user.role, email: user.email });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { user, token }
        });

    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        // Check for user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken({ id: user.id, role: user.role, email: user.email });

        // Remove password from response
        delete user.password_hash;

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            data: { user, token }
        });

    } catch (error) {
        next(error);
    }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT id, name, email, role, college_id, phone, department, course, branch, semester, is_verified FROM users WHERE id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { user: result.rows[0] }
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile credentials (semester, branch, etc)
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phone, department, course, branch, semester } = req.body;

        const updatedUser = await pool.query(
            `UPDATE users 
             SET name = $1, phone = $2, department = $3, course = $4, branch = $5, semester = $6
             WHERE id = $7 
             RETURNING id, name, email, role, college_id, phone, department, course, branch, semester, is_verified`,
            [name, phone, department, course, branch, semester, userId]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { user: updatedUser.rows[0] }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
