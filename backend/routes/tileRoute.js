const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createTile,
  getTiles,
  getTileById,
  updateTile,
  deleteTile,
  getGroutShapes,
  getShapeStyles,
  getScaleRange,
  getTilesWithColorsUsed
} = require("../controllers/tileController");

// Get available grout shapes
router.get("/grout-shapes", getGroutShapes);

// Get available shape styles
router.get("/shape-styles", getShapeStyles);

// Get scale range configuration
router.get("/scale-range", getScaleRange);

// Get tiles with colors used
router.get("/with-colors", getTilesWithColorsUsed);

// Create a new tile
router.post(
  "/",
  upload.fields([
    { name: "mainMask", maxCount: 1 },
    { name: "tileMasks", maxCount: 10 },
    { name: "borderMask", maxCount: 1 }
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
    { name: "tileMasks", maxCount: 10 },
    { name: "borderMask", maxCount: 1 }
  ]),
  updateTile
);

// Delete a tile
router.delete("/:id", deleteTile);

module.exports = router;
