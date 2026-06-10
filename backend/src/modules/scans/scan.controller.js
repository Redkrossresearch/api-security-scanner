const {
  createScan,
  getUserScans,
} = require("./scan.service");

const Scan =
  require("./scan.model");

const create = async (
  req,
  res
) => {
  try {
    const { targetUrl } =
      req.body;

console.log("REQ USER:", req.user);
console.log("TARGET URL:", targetUrl);

    const scan =
      await createScan(
        req.user._id,
        targetUrl
      );

    return res.status(201).json({
      success: true,
      scan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAll = async (
  req,
  res
) => {

  try {

    const scans =
      await getUserScans(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      scans,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};

const getScanHistory =
  async (req, res) => {

    try {

      const scans =
        await Scan.find()
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        scans,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

};

const getScanById =
  async (req, res) => {

    try {

      const scan =
        await Scan.findById(
          req.params.id
        );

      if (!scan) {

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Scan not found",
          });

      }

      return res.json({
        success: true,
        scan,
      });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message,
        });

    }

};

const deleteScan =
  async (req, res) => {

    try {

      const scan =
        await Scan.findByIdAndDelete(
          req.params.id
        );

      if (!scan) {

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Scan not found",
          });

      }

      return res.json({
        success: true,
        message:
          "Scan deleted",
      });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message,
        });

    }

};

module.exports = {
  create,
  getAll,
  getScanHistory,
  getScanById,
  deleteScan,
};