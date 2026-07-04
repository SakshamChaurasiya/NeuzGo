const User = require("../models/user.model");

// @desc    Get all users with search, filtering, sorting, pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res) => {
    try {
        const { search, role, status, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;

        const query = {};

        // Exclude the current admin from the list so they don't accidentally modify/delete themselves
        query._id = { $ne: req.user._id };

        if (role) {
            query.role = role;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } }
            ];
        }

        const parsedPage = Math.max(1, parseInt(page) || 1);
        const parsedLimit = Math.max(1, parseInt(limit) || 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const sortObj = {};
        sortObj[sortBy] = order === "asc" ? 1 : -1;

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("-password")
            .sort(sortObj)
            .skip(skip)
            .limit(parsedLimit);

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parsedPage,
                pages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        });
    } catch (error) {
        console.error("Get admin users error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching users."
        });
    }
};

// @desc    Update user details (username, email, role, phone)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (role !== undefined) user.role = role;

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: updatedUser
        });
    } catch (error) {
        console.error("Update user error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update user."
        });
    }
};

// @desc    Toggle user status (Suspend/Reactivate)
// @route   POST /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.status = user.status === "Active" ? "Suspended" : "Active";
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User status changed to ${user.status} successfully.`,
            data: { status: user.status }
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to toggle user status."
        });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to delete user."
        });
    }
};

module.exports = {
    getAdminUsers,
    updateUser,
    toggleUserStatus,
    deleteUser
};
