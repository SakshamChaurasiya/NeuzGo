const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, mobileNumber } = req.body;

        // 1. Validation: Check if all fields are provided
        if (!username || !email || !password || !confirmPassword || !mobileNumber) {
            return res.status(400).json({ message: "All fields (username, email, password, confirmPassword, mobileNumber) are required." });
        }

        // 2. Validation: Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // 3. Validation: Check password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        // 4. Validation: Check mobile number format (must be 10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileNumber)) {
            return res.status(400).json({ message: "Mobile number must be a valid 10-digit number." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 5. Validation: Check if user already exists (by email or mobile number)
        const emailExists = await User.findOne({ email: normalizedEmail });
        if (emailExists) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const phoneExists = await User.findOne({ phoneNumber: mobileNumber });
        if (phoneExists) {
            return res.status(400).json({ message: "An account with this mobile number already exists." });
        }

        // 6. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 7. Create and save user (mapping mobileNumber to the schema's phoneNumber)
        const user = new User({
            username: username.trim(),
            email: normalizedEmail,
            phoneNumber: mobileNumber,
            password: hashedPassword
        });

        await user.save();

        // 8. Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role || "user" },
            process.env.JWT_SECRET || "fallback_secret_key",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                zodiacSign: user.zodiacSign || "",
                role: user.role || "user"
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation: Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Account doesn't exist." });
        }

        // Check if account is suspended
        if (user.status === "Suspended") {
            return res.status(403).json({ message: "User account suspended." });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role || "user" },
            process.env.JWT_SECRET || "fallback_secret_key",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                zodiacSign: user.zodiacSign || "",
                role: user.role || "user"
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                phoneNumber: req.user.phoneNumber,
                zodiacSign: req.user.zodiacSign || "",
                role: req.user.role || "user"
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Server error retrieving user profile." });
    }
};

const updateZodiac = async (req, res) => {
    try {
        const { zodiacSign } = req.body;
        if (!zodiacSign) {
            return res.status(400).json({ message: "Zodiac sign is required." });
        }
        const normalizedSign = zodiacSign.toLowerCase().trim();
        const horoscopeService = require("../service/horoscope.service");
        if (!horoscopeService.VALID_SIGNS.has(normalizedSign)) {
            return res.status(400).json({ message: `Invalid zodiac sign. Must be one of: ${Array.from(horoscopeService.VALID_SIGNS).join(", ")}` });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.zodiacSign = normalizedSign;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Zodiac sign updated successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                zodiacSign: user.zodiacSign,
                role: user.role || "user"
            }
        });
    } catch (error) {
        console.error("Update zodiac error:", error);
        return res.status(500).json({ message: "Server error updating zodiac sign preference." });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    updateZodiac
};
