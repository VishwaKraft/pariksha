const User = require("../model/User");

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const emailExist = await User.findOne({ email: email });
    if (emailExist)
      return res.status(400).json({ error: "email already exists" });

    const user = new User({
      name,
      phoneNumber,
      email,
      password: password,
    });

    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.unfair = async (req, res, next) => {
  try {
    const user = await Response.findById(req.user);
    var x = user.switchCounter;
    user.switchCounter = ++x;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const results = {};
  results.total = await User.find({}).countDocuments()
  try {
    await User.find({}).skip((page - 1) * limit).limit(limit).sort({ name: 1 }).then(result => {
      if (result) {
        results.results = result;
        results.page = req.query.page;
        res.status(200).json(results);
      } else {
        res.status(404).json({
          success: false,
          error: "No User Found"
        })
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.updateOne({ _id: id }, req.body)
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false })
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.deleteOne({ _id: id })
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false })
  }
};