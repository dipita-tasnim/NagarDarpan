const Authority = require('../models/Authority');

exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: authorities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAuthority = async (req, res) => {
  try {
    const authority = new Authority(req.body);
    await authority.save();
    res.status(201).json({ success: true, data: authority });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthority = async (req, res) => {
  try {
    const authority = await Authority.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!authority) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: authority });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthority = async (req, res) => {
  try {
    const authority = await Authority.findByIdAndDelete(req.params.id);
    if (!authority) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
