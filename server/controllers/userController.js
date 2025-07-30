export const getUserProfile = (req, res) => {
  res.status(200).json({
    msg: "User profile fetched successfully",
    user: req.user, // contains { id, name }
  });
};
