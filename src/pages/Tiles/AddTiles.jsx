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
    groutShapes,
    shapeStyles,
    scaleRange,
    fetchGroutShapes,
    fetchShapeStyles,
    fetchScaleRange,
    fetchTileById
  } = useAuth();

  const emptyFormState = {
    tileName: "",
    category: "",
    mainMask: null,
    backgroundColor: "",
    groutShape: "",
    shapeStyle: "",
    scale: "1",
    tileMasks: [],
    tileMaskColors: [],
    borderMask: null,
    borderColor: "",
  };

  // Initialize state from localStorage or default values
  const getInitialFormData = () => {
    if (!isEditing) {
      // For add mode, try to load from add-specific localStorage
      const savedFormData = localStorage.getItem('addTileFormData');
      if (savedFormData) {
        try {
          return JSON.parse(savedFormData);
        } catch (error) {
          console.error('Error parsing saved add form data:', error);
          return emptyFormState;
        }
      }
    }
    return emptyFormState;
  };

  const getInitialPreviews = () => {
    if (!isEditing) {
      // For add mode, try to load from add-specific localStorage
      const savedPreviews = localStorage.getItem('addTilePreviews');
      if (savedPreviews) {
        try {
          return JSON.parse(savedPreviews);
        } catch (error) {
          console.error('Error parsing saved add previews:', error);
          return { main: null, masks: [] };
        }
      }
    }
    return { main: null, masks: [] };
  };

  const getInitialColorHexCodes = () => {
    if (!isEditing) {
      // For add mode, try to load from add-specific localStorage
      const savedColorHexCodes = localStorage.getItem('addTileColorHexCodes');
      if (savedColorHexCodes) {
        try {
          return JSON.parse(savedColorHexCodes);
        } catch (error) {
          console.error('Error parsing saved add color hex codes:', error);
          return { main: '', masks: [] };
        }
      }
    }
    return { main: '', masks: [] };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [mainMaskPreview, setMainMaskPreview] = useState(getInitialPreviews().main);
  const [tileMaskPreviews, setTileMaskPreviews] = useState(getInitialPreviews().masks);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColorTarget, setCurrentColorTarget] = useState(null);
  const [selectedColorHexCodes, setSelectedColorHexCodes] = useState(getInitialColorHexCodes());
  const [deletedSubMasks, setDeletedSubMasks] = useState([]);
  const [borderMaskPreview, setBorderMaskPreview] = useState(null);

  // Save form data while working (add mode only)
  useEffect(() => {
    if (!isEditing && formData.tileName) {
      localStorage.setItem('addTileFormData', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  // Save previews when they change (add mode only)
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('addTilePreviews', JSON.stringify({
        main: mainMaskPreview,
        masks: tileMaskPreviews
      }));
    }
  }, [mainMaskPreview, tileMaskPreviews, isEditing]);

  // Save color hex codes when they change (add mode only)
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('addTileColorHexCodes', JSON.stringify(selectedColorHexCodes));
    }
  }, [selectedColorHexCodes, isEditing]);

  // Add debug log to see what is being set as formData
  useEffect(() => {
    console.log('Current formData state:', formData);
  }, [formData]);

  // Update the data fetching effect
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // First load all necessary data
        await Promise.all([
          fetchTileColors(),
          fetchTileCategories(),
          fetchGroutShapes(),
          fetchShapeStyles(),
          fetchScaleRange()
        ]);

        // Only then proceed with setting form data if editing
        if (isEditing && id) {
          // Always fetch the latest tile data from the backend
          const tileToEdit = await fetchTileById(id);
          console.log('Fetched tile to edit:', tileToEdit); // Debug log
          if (tileToEdit) {
            // Only warn, but do not return early
            if (!tileToEdit.backgroundColor) {
              console.warn("No background color in tile:", tileToEdit);
            }
            if (!tileToEdit.subMasks) {
              console.warn("No subMasks in tile:", tileToEdit);
            }

            const newFormData = {
              tileName: tileToEdit.tileName || "",
              category: tileToEdit.category?._id || tileToEdit.category || "",
              backgroundColor: tileToEdit.backgroundColor?._id || tileToEdit.backgroundColor || "",
              groutShape: tileToEdit.groutShape || "Square",
              shapeStyle: tileToEdit.shapeStyle || "Square",
              scale: tileToEdit.scale || "1",
              mainMask: null,
              tileMasks: tileToEdit.subMasks?.map(mask => mask.image) || [],
              tileMaskColors: tileToEdit.subMasks?.map(mask => mask.backgroundColor?._id || mask.backgroundColor) || [],
            };

            console.log('Setting form data:', newFormData); // Debug log
            setFormData(newFormData);

            // Set previews
            if (tileToEdit.mainMask) {
              setMainMaskPreview(tileToEdit.mainMask);
            }

            if (tileToEdit.subMasks?.length > 0) {
              setTileMaskPreviews(tileToEdit.subMasks.map(mask => mask.image));
            }

            // Set color hex codes - ensure we're using the populated color data
            const mainColor = tileToEdit.backgroundColor?.hexCode || "";
            const maskColors = tileToEdit.subMasks?.map(mask => 
              mask.backgroundColor?.hexCode || ""
            ) || [];

            setSelectedColorHexCodes({
              main: mainColor,
              masks: maskColors
            });

            setDeletedSubMasks([]); // Reset deleted submasks for this tile
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all submasks have colors
    const hasUncoloredSubmasks = formData.tileMaskColors.some(color => !color);
    if (hasUncoloredSubmasks) {
      alert("Please select colors for all submasks before submitting.");
      return;
    }

    try {
      const data = new FormData();
      
      // Different validation for new tiles vs updates
      if (!isEditing) {
        // Validate all required fields for new tiles
        if (!formData.tileName || !formData.category || !formData.mainMask) {
          alert("Please fill in all required fields and upload a main mask image.");
          return;
        }
      } else {
        // For updates, only validate if the field has been changed
        if (!formData.tileName) {
          alert("Tile name is required.");
          return;
        }
      }

      // Append form data
      data.append("tileName", formData.tileName.trim());
      if (formData.category) data.append("category", formData.category);
      if (formData.backgroundColor) {
        // Make sure we're sending the ID string, not an object
        const colorId = typeof formData.backgroundColor === 'object' ? formData.backgroundColor._id : formData.backgroundColor;
        data.append("backgroundColor", colorId);
      }
      if (formData.groutShape) data.append("groutShape", formData.groutShape);
      if (formData.shapeStyle) data.append("shapeStyle", formData.shapeStyle);
      if (formData.scale) data.append("scale", formData.scale);

      // Append main mask file only if it's provided
      if (formData.mainMask instanceof File) {
        data.append("mainMask", formData.mainMask);
      }

      // Append tile masks and their colors only if both are provided
      if (formData.tileMasks && formData.tileMasks.length > 0) {
        formData.tileMasks.forEach((file, index) => {
          if (file instanceof File) {
            // Handle new submask files
            data.append("tileMasks", file);
            if (!formData.tileMaskColors[index]) {
              throw new Error("Please select a color for all tile masks.");
            }
            const colorId = typeof formData.tileMaskColors[index] === 'object' ? formData.tileMaskColors[index]._id : formData.tileMaskColors[index];
            data.append("tileMaskColors", colorId);
          } else if (isEditing && typeof file === 'string') {
            // Handle existing submask URLs during edit
            if (!formData.tileMaskColors[index]) {
              throw new Error("Please select a color for all tile masks.");
            }
            const colorId = typeof formData.tileMaskColors[index] === 'object' ? formData.tileMaskColors[index]._id : formData.tileMaskColors[index];
            data.append("tileMaskColors", colorId);
          }
        });
      }

      // Append deleted submask IDs if any
      if (isEditing && deletedSubMasks.length > 0) {
        deletedSubMasks.forEach(id => {
          data.append("deletedSubMasks", id);
        });
      }

      // Append border mask if provided
      if (formData.borderMask instanceof File) {
        data.append("borderMask", formData.borderMask);
      }

      // Append border color if provided
      if (formData.borderColor) {
        const colorId = typeof formData.borderColor === 'object' ? formData.borderColor._id : formData.borderColor;
        data.append("borderColor", colorId);
      }

      if (isEditing) {
        const response = await updateTile(id, data);
        if (response?.error) {
          throw new Error(response.error);
        }
        // Clear edit-specific storage
        localStorage.removeItem('editTileFormData');
        localStorage.removeItem('editTilePreviews');
        localStorage.removeItem('editTileColorHexCodes');
        alert("Tile updated successfully!");
      } else {
        const response = await addTile(data);
        if (response?.error) {
          throw new Error(response.error);
        }
        // Clear add-specific storage
        localStorage.removeItem('addTileFormData');
        localStorage.removeItem('addTilePreviews');
        localStorage.removeItem('addTileColorHexCodes');
        alert("Tile added successfully!");
      }

      navigate("/dashboard/all-tiles");
    } catch (err) {
      console.error("Error submitting tile:", err);
      alert(err.message || "Failed to submit tile. Please check all required fields and try again.");
    }
  };

  // Helper function to get hex code for a color ID
  const getColorHexCode = (colorId) => {
    const color = tileColors.find((c) => c._id === colorId);
    return color ? color.hexCode : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorSelect = (color) => {
    if (currentColorTarget === "main") {
      // Update main mask color
      setFormData((prev) => ({
        ...prev,
        backgroundColor: color.noBackground ? null : color._id,
      }));
      setSelectedColorHexCodes((prev) => ({
        ...prev,
        main: color.noBackground ? 'transparent' : color.hexCode,
      }));
    } else if (currentColorTarget === "border") {
      setFormData((prev) => ({
        ...prev,
        borderColor: color.noBackground ? null : color._id,
      }));
      setShowColorPicker(false);
      return;
    } else if (typeof currentColorTarget === "number") {
      // Update submask color
      setFormData((prev) => {
        const newTileMaskColors = [...prev.tileMaskColors];
        newTileMaskColors[currentColorTarget] = color._id;
        return {
          ...prev,
          tileMaskColors: newTileMaskColors,
        };
      });

      setSelectedColorHexCodes((prev) => {
        const newMasks = [...prev.masks];
        newMasks[currentColorTarget] = color.hexCode;
        return {
          ...prev,
          masks: newMasks,
        };
      });
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

      // Update form data with new mask
      setFormData((prev) => ({
        ...prev,
        tileMasks: [...prev.tileMasks, newFile],
        tileMaskColors: [...prev.tileMaskColors, ""], // Initialize with empty string
      }));

      // Update previews
      setTileMaskPreviews((prev) => [...prev, dataUrl]);

      // Update color hex codes
      setSelectedColorHexCodes((prev) => ({
        ...prev,
        masks: [...prev.masks, ""],
      }));

      // Set current color target and show color picker
      const newIndex = formData.tileMasks.length;
      setCurrentColorTarget(newIndex);
      setShowColorPicker(true);
    } else if (name === "borderMask" && files[0]) {
      const dataUrl = await readFileAsDataURL(files[0]);
      setFormData((prev) => ({
        ...prev,
        borderMask: files[0],
      }));
      setBorderMaskPreview(dataUrl);
    }
  };

  // Add useEffect to handle color updates
  useEffect(() => {
    if (tileColors && tileColors.length > 0) {
      // Update main mask color hex code
      if (formData.backgroundColor) {
        const mainColor = tileColors.find(c => c._id === formData.backgroundColor);
        if (mainColor) {
          setSelectedColorHexCodes(prev => ({
            ...prev,
            main: mainColor.hexCode
          }));
        }
      }

      // Update submask color hex codes
      const updatedMasks = formData.tileMaskColors.map(colorId => {
        const color = tileColors.find(c => c._id === colorId);
        return color ? color.hexCode : "";
      });

      setSelectedColorHexCodes(prev => ({
        ...prev,
        masks: updatedMasks
      }));
    }
  }, [formData.backgroundColor, formData.tileMaskColors, tileColors]);

  // Add useEffect to handle color updates
  useEffect(() => {
    // When a new mask is added (and it doesn't have a color yet)
    if (formData.tileMasks.length > 0 && 
        formData.tileMasks.length > formData.tileMaskColors.filter(Boolean).length) {
      const newIndex = formData.tileMasks.length - 1;
      setCurrentColorTarget(newIndex);
      setShowColorPicker(true);
    }
  }, [formData.tileMasks.length, formData.tileMaskColors]);

  const removeTileMask = (index) => {
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        tileMasks: prev.tileMasks.filter((_, idx) => idx !== index),
        tileMaskColors: prev.tileMaskColors.filter((_, idx) => idx !== index),
      };
      // Save updated mask colors to localStorage (add mode only)
      if (!isEditing) {
        localStorage.setItem('tileMaskData', JSON.stringify({
          tileMaskColors: newFormData.tileMaskColors,
        }));
      }
      return newFormData;
    });

    // If we're in edit mode and the mask is an existing one (has a URL), add its ID to deletedSubMasks
    if (isEditing && typeof formData.tileMasks[index] === 'string') {
      const tileToEdit = tiles.find((t) => t._id === id);
      if (tileToEdit && tileToEdit.subMasks[index]) {
        setDeletedSubMasks(prev => [...prev, tileToEdit.subMasks[index]._id]);
      }
    }

    setTileMaskPreviews((prev) => {
      const newPreviews = prev.filter((_, idx) => idx !== index);
      // Save updated previews to localStorage (add mode only)
      if (!isEditing) {
        localStorage.setItem('tilePreviews', JSON.stringify({
          main: mainMaskPreview,
          masks: newPreviews
        }));
      }
      return newPreviews;
    }); 

    setSelectedColorHexCodes((prev) => {
      const newColorHexCodes = {
        ...prev,
        masks: prev.masks.filter((_, idx) => idx !== index),
      };
      // Save updated color hex codes to localStorage (add mode only)
      if (!isEditing) {
        localStorage.setItem('tileColorHexCodes', JSON.stringify(newColorHexCodes));
      }
      return newColorHexCodes;
    });
  };

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? "Edit Tile" : "Add New Tile"} - Lili Tile Customizer
        </title>
        <meta
          name="description"
          content={`${
            isEditing ? "Edit existing" : "Add new"
          } tile in the Lili Tile Customizer.`}
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

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6"
          >
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
                <div className="w-full max-w-md overflow-hidden">
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-[#bd5b4c] transition-colors">
                    <div className={`relative w-full ${mainMaskPreview ? 'h-auto' : 'h-52'}`}>
                      <input
                        type="file"
                        name="mainMask"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {mainMaskPreview ? (
                        <img
                          src={mainMaskPreview}
                          alt="Main mask preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center max-h-60">
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
                {/* Border Mask */}
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                  Border Mask
                </label>
                <div className="w-full max-w-md overflow-hidden">
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-[#bd5b4c] transition-colors">
                    <div className={`relative w-full ${borderMaskPreview ? 'h-auto' : 'h-32'}`}>
                      <input
                        type="file"
                        name="borderMask"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {borderMaskPreview ? (
                        <img
                          src={borderMaskPreview}
                          alt="Border mask preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center max-h-32">
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
                          style={{
                            backgroundColor: selectedColorHexCodes.main,
                          }}
                        />
                      )}
                    </div>
                  </button>
                </div>
                {/* Border Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Color
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentColorTarget("border");
                      setShowColorPicker(true);
                    }}
                    className="w-full px-3 py-2 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#bd5b4c] flex items-center justify-between group"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {formData.borderColor
                        ? getColorHexCode(formData.borderColor) || "Select Color"
                        : "Select Color"}
                    </span>
                    <div className="flex items-center gap-2">
                      {formData.borderColor && (
                        <div
                          className="w-6 h-6 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: getColorHexCode(formData.borderColor),
                          }}
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
                  
                  >
                    <option value="">Select Grout Shape</option>
                    {groutShapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
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
                  
                  >
                    <option value="">Select Shape Style</option>
                    {shapeStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
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
                    min={scaleRange.min}
                    max={scaleRange.max}
                    step={scaleRange.step}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                  
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
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4  gap-4">
                {/* Existing Masks */}
                {formData.tileMasks.map((_, index) => (
                  <div key={index} className="border-2 rounded-lg">
                    <div className="relative  w-full h-auto">
                      <img
                        src={tileMaskPreviews[index]}
                        alt={`Tile mask ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg"
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
                                backgroundColor:
                                  selectedColorHexCodes.masks[index],
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
                      <button
                        type="button"
                        onClick={() => handleColorSelect({ hexCode: 'transparent', noBackground: true })}
                        className={`w-12 h-12 rounded-lg border-2 hover:scale-110 transition-transform ${
                          currentColorTarget === "main" && !formData.backgroundColor
                            ? "border-[#bd5b4c]"
                            : "border-gray-200"
                        }`}
                        style={{
                          backgroundColor: 'noBackground',
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'
                        }}
                        title="noBackground"
                      />
                      {tileColors.map((color) => (
                        <button
                          key={color._id}
                          type="button"
                          onClick={() => handleColorSelect(color)}
                          className={`w-12 h-12 rounded-lg border-2 hover:scale-110 transition-transform ${
                            (currentColorTarget === "main"
                              ? formData.backgroundColor === color._id
                              : formData.tileMaskColors[currentColorTarget]) === 
                            color._id
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
                {loading 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update Tile" : "Add Tile")}
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
