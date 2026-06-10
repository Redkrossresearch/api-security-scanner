const Report =
  require("./report.model");

const getReport =
  async (req, res) => {

    try {

      const report =
        await Report.findOne({
          scanId:
            req.params.scanId,
        });

      if (!report) {
        return res.status(404).json({
          success: false,
          message:
            "Report not found",
        });
      }

      res.json({
        success: true,
        report,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };

module.exports = {
  getReport,
};