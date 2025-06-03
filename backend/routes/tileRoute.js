const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createTile,
  getTiles,
  getTileById,
  updateTile,
  deleteTile
} = require("../controllers/tileController");

// Create a new tile
router.post(
  "/",
  upload.fields([
    { name: "mainMask", maxCount: 1 },
    { name: "tileMasks", maxCount: 10 }
  ]),
  createTile
);

// Get all tiles
router.get("/", getTiles);

// Get a specific tile
router.get("/:id", getTileById);

// Update a tile
router.put(
  "/:id",
  upload.fields([
    { name: "mainMask", maxCount: 1 },
    { name: "tileMasks", maxCount: 10 }
  ]),
  updateTile
);

// Delete a tile
router.delete("/:id", deleteTile);

module.exports = router;
