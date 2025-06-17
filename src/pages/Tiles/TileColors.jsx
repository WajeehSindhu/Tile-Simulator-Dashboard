import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

const TileColors = () => {
  const {
    tileColors,
    fetchTileColors,
    addTileColor,
    deleteTileColor,
    updateTileColor,
    colorLoading,
    colorError,
  } = useAuth();

  const [newColor, setNewColor] = useState("#000000");
  const [newNoBackground, setNewNoBackground] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  useEffect(() => {
    fetchTileColors();
  }, []);

  const handleAddColor = async (e) => {
    e.preventDefault();
    try {
      await addTileColor(newColor, newNoBackground);
      setNewColor("#000000");
      setNewNoBackground(false);
    } catch (err) {}
  };

  const handleEditClick = (color) => {
    setEditingColor({
      id: color._id,
      hexCode: color.hexCode,
      noBackground: color.noBackground
    });
  };

  const handleUpdateColor = async (e) => {
    e.preventDefault();
    try {
      await updateTileColor(editingColor.id, editingColor.hexCode, editingColor.noBackground);
      setEditingColor(null);
    } catch (err) {}
  };

  const handleDeleteColor = async (id) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      try {
        await deleteTileColor(id);
        // Adjust current page if needed
        const remainingItems = tileColors.length - 1;
        const totalPagesAfterDelete = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > totalPagesAfterDelete) {
          setCurrentPage(totalPagesAfterDelete);
        }
      } catch (err) {}
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(tileColors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentColors = tileColors.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <Helmet>
        <title>Tile Colors - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Choose and submit tile colors for your tile customization."
        />
      </Helmet>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingColor ? "Edit Color" : "Add New Color"}
          </h2>
          <form
            onSubmit={editingColor ? handleUpdateColor : handleAddColor}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={editingColor ? editingColor.hexCode : newColor}
                onChange={(e) =>
                  editingColor
                    ? setEditingColor({
                        ...editingColor,
                        hexCode: e.target.value,
                      })
                    : setNewColor(e.target.value)
                }
                className="w-full h-10 cursor-pointer border rounded"
              />
              <div className="mt-2 text-sm text-gray-500">
                {editingColor ? editingColor.hexCode : newColor}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingColor ? editingColor.noBackground : newNoBackground}
                  onChange={(e) =>
                    editingColor
                      ? setEditingColor({
                          ...editingColor,
                          noBackground: e.target.checked,
                        })
                      : setNewNoBackground(e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">No Background (for PNG images)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bd5b4c] text-white py-2 px-4 rounded hover:bg-[#a54a3b] transition-colors"
            >
              {editingColor ? "Update Color" : "Add Color"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Color List</h2>
          {colorLoading ? (
            <div className="text-center py-4">Loading colors...</div>
          ) : colorError ? (
            <div className="text-center py-4 text-red-500">{colorError}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentColors.map((color) => (
                <div
                  key={color._id}
                  className="relative group border rounded-lg p-2"
                >
                  <div
                    className="w-full h-24 rounded-lg mb-2"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  <div className="text-xs text-gray-600 mb-2">{color.hexCode}</div>
                  {color.noBackground && (
                    <div className="text-xs text-blue-600 mb-2">No Background</div>
                  )}
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEditClick(color)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteColor(color._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TileColors;
