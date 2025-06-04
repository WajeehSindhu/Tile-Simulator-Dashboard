import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

const AddTiles = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get tile ID from URL if editing
  const isEditing = Boolean(id);
  
  const {
    addTile,
    updateTile,
    tiles,
    fetchTiles,
    tileColors,
    fetchTileColors,
    colorLoading,
    colorError,
    tileCategories,
    fetchTileCategories,
    categoryLoading,
    categoryError,
    error,
    tileLoading: loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    tileName: "",
    category: "",
    mainMask: null,
    backgroundColor: "",
    groutShape: "Square",
    shapeStyle: "Square",
    scale: "1",
    tileMasks: [],
    tileMaskColors: [],
  });

  const [mainMaskPreview, setMainMaskPreview] = useState(null);
  const [tileMaskPreviews, setTileMaskPreviews] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColorTarget, setCurrentColorTarget] = useState(null);

  // Add state for color previews
  const [selectedColorHexCodes, setSelectedColorHexCodes] = useState({
    main: "",
    masks: []
  });

  // Helper function to get hex code for a color ID
  const getColorHexCode = (colorId) => {
    const color = tileColors.find(c => c._id === colorId);
    return color ? color.hexCode : "";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchTileColors(),
          fetchTileCategories(),
          fetchTiles()
        ]);

        // If editing, populate form with tile data
        if (isEditing && tiles) {
          const tileToEdit = tiles.find(t => t._id === id);
          if (tileToEdit) {
            setFormData({
              tileName: tileToEdit.tileName || "",
              category: tileToEdit.category?._id || "",
              backgroundColor: tileToEdit.backgroundColor || "",
              groutShape: tileToEdit.groutShape || "Square",
              shapeStyle: tileToEdit.shapeStyle || "Square",
              scale: tileToEdit.scale || "1",
              mainMask: null, // Don't set file objects
              tileMasks: [], // Don't set file objects
              tileMaskColors: tileToEdit.tileMaskColors || [],
            });

            // Set previews for existing images
            if (tileToEdit.mainMask) {
              setMainMaskPreview(`http://localhost:5000/uploads/${tileToEdit.mainMask}`);
            }
            
            if (tileToEdit.tileMasks && tileToEdit.tileMasks.length > 0) {
              setTileMaskPreviews(
                tileToEdit.tileMasks.map(mask => 
                  `http://localhost:5000/${mask.image}`
                )
              );
            }

            // Set color previews
            setSelectedColorHexCodes({
              main: getColorHexCode(tileToEdit.backgroundColor),
              masks: tileToEdit.tileMaskColors.map(colorId => getColorHexCode(colorId))
            });
          }
        }
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      }
    };

    if (isMounted) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorSelect = (color) => {
    if (currentColorTarget === "main") {
      setFormData((prev) => ({
        ...prev,
        backgroundColor: color._id,
      }));
      setSelectedColorHexCodes(prev => ({
        ...prev,
        main: color.hexCode
      }));
    } else if (typeof currentColorTarget === "number") {
      setFormData((prev) => ({
        ...prev,
        tileMaskColors: prev.tileMaskColors.map((c, idx) =>
          idx === currentColorTarget ? color._id : c
        ),
      }));
      setSelectedColorHexCodes(prev => ({
        ...prev,
        masks: prev.masks.map((hex, idx) =>
          idx === currentColorTarget ? color.hexCode : hex
        )
      }));
    }
    setShowColorPicker(false);
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (name === "mainMask" && files[0]) {
      const dataUrl = await readFileAsDataURL(files[0]);
      setFormData((prev) => ({
        ...prev,
        mainMask: files[0],
      }));
      setMainMaskPreview(dataUrl);
    } else if (name === "tileMasks") {
      const newFile = files[0];
      const dataUrl = await readFileAsDataURL(newFile);

      setFormData((prev) => ({
        ...prev,
        tileMasks: [...prev.tileMasks, newFile],
        tileMaskColors: [...prev.tileMaskColors, ""],
      }));
      setTileMaskPreviews((prev) => [...prev, dataUrl]);
      setSelectedColorHexCodes(prev => ({
        ...prev,
        masks: [...prev.masks, ""]
      }));
    }
  };

  const removeTileMask = (index) => {
    setFormData((prev) => ({
      ...prev,
      tileMasks: prev.tileMasks.filter((_, idx) => idx !== index),
      tileMaskColors: prev.tileMaskColors.filter((_, idx) => idx !== index),
    }));
    setTileMaskPreviews((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedColorHexCodes(prev => ({
      ...prev,
      masks: prev.masks.filter((_, idx) => idx !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      tileName: "",
      category: "",
      mainMask: null,
      backgroundColor: "",
      groutShape: "Square",
      shapeStyle: "Square",
      scale: "1",
      tileMasks: [],
      tileMaskColors: [],
    });
    setMainMaskPreview(null);
    setTileMaskPreviews([]);
    setSelectedColorHexCodes({
      main: "",
      masks: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("tileName", formData.tileName);
      data.append("category", formData.category);
      data.append("backgroundColor", formData.backgroundColor);
      data.append("groutShape", formData.groutShape);
      data.append("shapeStyle", formData.shapeStyle);
      data.append("scale", formData.scale);

      if (formData.mainMask) {
        data.append("mainMask", formData.mainMask);
      }

      formData.tileMasks.forEach((file, index) => {
        data.append("tileMasks", file);
        data.append("tileMaskColors", formData.tileMaskColors[index] || "");
      });

      if (isEditing) {
        await updateTile(id, data);
        alert("Tile updated successfully!");
      } else {
        await addTile(data);
        resetForm();
        alert("Tile added successfully!");
      }
      
      navigate("/dashboard/all-tiles");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? "Edit Tile" : "Add New Tile"} - Lili Tile Customizer</title>
        <meta
          name="description"
          content={`${isEditing ? "Edit existing" : "Add new"} tile in the Lili Tile Customizer.`}
        />
      </Helmet>

      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Tile" : "Add New Tile"}
            </h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Top Section: Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Tile Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tile Name
                </label>
                <input
                  type="text"
                  name="tileName"
                  value={formData.tileName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                  required
                />
              </div>

              {/* Tile Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tile Category
                </label>
                {categoryLoading ? (
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
                    Loading categories...
                  </div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                    required
                    disabled={categoryLoading || categoryError}
                  >
                    <option value="">Select Category</option>
                    {tileCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {categoryError && (
                  <p className="mt-1 text-sm text-red-600">{categoryError}</p>
                )}
              </div>
            </div>

            {/* Main Mask and Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column - Main Mask */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Mask
                </label>
                <div className="max-w-md overflow-hidden ">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-[#bd5b4c] transition-colors">
                    <div className="relative w-full h-80">
                      <input
                        type="file"
                        name="mainMask"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      {mainMaskPreview ? (
                        <img
                          src={mainMaskPreview}
                          alt="Main mask preview"
                          className="w-full h-full object-cover rounded-lg "
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-4">
                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentColorTarget("main");
                      setShowColorPicker(true);
                    }}
                    className="w-full px-3 py-2 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#bd5b4c] flex items-center justify-between group"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {selectedColorHexCodes.main || "Select Color"}
                    </span>
                    <div className="flex items-center gap-2">
                      {formData.backgroundColor && (
                        <div
                          className="w-6 h-6 rounded-full border shadow-sm"
                          style={{ backgroundColor: selectedColorHexCodes.main }}
                        />
                      )}
                    </div>
                  </button>
                </div>

                {/* Grout Shape */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grout Shape
                  </label>
                  <select
                    name="groutShape"
                    value={formData.groutShape}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                    required
                  >
                    <option value="Square">Square</option>
                    <option value="No Grout">No Grout</option>
                    <option value="H2 Lines">H2 Lines</option>
                  </select>
                </div>

                {/* Shape Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shape Style
                  </label>
                  <select
                    name="shapeStyle"
                    value={formData.shapeStyle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                    required
                  >
                    <option value="Square">Square</option>
                    <option value="Hexagon">Hexagon</option>
                    <option value="Lola">Lola</option>
                    <option value="Rectangle 2x8">Rectangle 2x8</option>
                    <option value="Triangle">Triangle</option>
                    <option value="Rectangle 4x8">Rectangle 4x8</option>
                    <option value="Arabesquare">Arabesquare</option>
                  </select>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale
                  </label>
                  <input
                    type="number"
                    name="scale"
                    value={formData.scale}
                    onChange={handleChange}
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                    required
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    <p>
                      Value of 1 will have the tile render at the normal size.
                    </p>
                    <p>
                      A value from 0-1 (ie 0.5) will have the tile render at a
                      smaller size.
                    </p>
                    <p>
                      A value {">"}1 will have the tile render at a larger size
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile Masks Section */}
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Tile Masks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Existing Masks */}
                {formData.tileMasks.map((_, index) => (
                  <div key={index} className="border-2 rounded-lg">
                    <div className="relative  w-full h-52">
                      <img
                        src={tileMaskPreviews[index]}
                        alt={`Tile mask ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeTileMask(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                        title="Remove mask"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentColorTarget(index);
                          setShowColorPicker(true);
                        }}
                        className="w-full p-2 border rounded-md bg-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#bd5b4c] flex items-center justify-between group"
                      >
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">
                          {selectedColorHexCodes.masks[index] || "Select Color"}
                        </span>
                        <div className="flex items-center gap-1">
                          {formData.tileMaskColors[index] && (
                            <div
                              className="w-4 h-4 rounded-full border shadow-sm"
                              style={{
                                backgroundColor: selectedColorHexCodes.masks[index]
                              }}
                            />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Mask Card */}
                <div className="relative">
                  <input
                    type="file"
                    name="tileMasks"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-[#bd5b4c] transition-colors h-full">
                    <div className="aspect-square w-full">
                      <div className="flex flex-col items-center justify-center h-full">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Picker Popup */}
            {showColorPicker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 max-w-lg w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Color</h3>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {colorLoading ? (
                    <div className="text-center py-4">Loading colors...</div>
                  ) : colorError ? (
                    <div className="text-center py-4 text-red-500">
                      {colorError}
                    </div>
                  ) : tileColors.length === 0 ? (
                    <div className="text-center py-4">No colors available</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {tileColors.map((color) => (
                        <button
                          key={color._id}
                          type="button"
                          onClick={() => handleColorSelect(color)}
                          className={`w-12 h-12 rounded-lg border-2 hover:scale-110 transition-transform ${
                            (currentColorTarget === "main"
                              ? formData.backgroundColor
                              : formData.tileMaskColors[currentColorTarget]) === color._id
                              ? "border-[#bd5b4c]"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                          title={color.hexCode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit and Cancel Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } bg-[#bd5b4c] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors`}
              >
                {loading ? "Adding..." : "Add Tile"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/all-tiles")}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTiles;
