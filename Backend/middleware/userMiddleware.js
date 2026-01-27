module.exports = function (req, res, next) {
    if (req.user.role !== "user") {
        return res
            .status(403)
            .json({ message: "Access denied. User only route." });
    }
    next();
};
