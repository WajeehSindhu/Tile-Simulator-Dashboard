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
  "/tiles",
  upload.fields([
    { name: "mainMask", maxCount: 1 },
    { name: "tileMasks", maxCount: 10 }
  ]),
  createTile
);

// Get all tiles
router.get("/tiles", getTiles);

// Get a specific tile
router.get("/tiles/:id", getTileById);

// Update a tile
router.put(
  "/tiles/:id",
  upload.fields([
    { name: "mainMask", maxCount: 1 },
    { name: "tileMasks", maxCount: 10 }
  ]),
  updateTile
);

// Delete a tile
router.delete("/tiles/:id", deleteTile);

module.exports = router;
