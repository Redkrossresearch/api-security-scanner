const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/auth.middleware");

const {
  create,
  getAll,
  getScanHistory,
  getScanById,
  deleteScan,
} = require(
  "./scan.controller"
);


router.post(
  "/",
  authenticate,
  create
);

router.get(
  "/",
  authenticate,
  getAll
);

router.get(
  "/history",
  getScanHistory
);

router.get(
  "/:id",
  getScanById
);

router.delete(
  "/:id",
  deleteScan
);

module.exports = router;