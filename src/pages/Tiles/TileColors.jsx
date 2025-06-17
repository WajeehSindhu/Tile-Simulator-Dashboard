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
  const [editingColor, setEditingColor] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  useEffect(() => {
    fetchTileColors();
  }, []);

  const handleAddColor = async (e) => {
    e.preventDefault();
    try {
      await addTileColor(newColor);
      setNewColor("#000000");
    } catch (err) {}
  };

  const handleEditClick = (color) => {
    setEditingColor({
      id: color._id,
      hexCode: color.hexCode,
    });
  };

  const handleUpdateColor = async (e) => {
    e.preventDefault();
    try {
      await updateTileColor(editingColor.id, editingColor.hexCode);
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

            <div className="flex gap-2 text-sm">
              <button
                type="submit"
                className="bg-[#bd5b4c] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                disabled={colorLoading}
              >
                {colorLoading
                  ? editingColor
                    ? "Updating..."
                    : "Adding..."
                  : editingColor
                  ? "Update Color"
                  : "Add Color"}
              </button>
              {editingColor && (
                <button
                  type="button"
                  onClick={() => setEditingColor(null)}
                  className=" bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
            {colorError && (
              <div className="text-sm text-red-600">{colorError}</div>
            )}
          </form>
        </div>
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold p-6 border-b">
            All Tile Colors
          </h2>
          {tileColors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No colors found. Add your first color!
            </div>
          ) : (
            <>
              <div className="divide-y custom-scrollbar overflow-x-auto">
                {currentColors.map((color) => (
                  <div
                    key={color._id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded border shadow-sm"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <div className="text-sm text-gray-600 whitespace-nowrap">
                        {color.hexCode}
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(color)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteColor(color._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {tileColors.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-4 p-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                        currentPage === idx + 1
                          ? "bg-[#bd5b4c] text-white"
                          : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TileColors;
