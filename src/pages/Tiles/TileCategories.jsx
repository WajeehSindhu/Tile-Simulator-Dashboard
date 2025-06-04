import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 14;

const TileCategories = () => {
  const {
    tileCategories,
    categoryLoading,
    categoryError,
    fetchTileCategories,
    addTileCategory,
    updateTileCategory,
    deleteTileCategory,
  } = useAuth();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTileCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");

    try {
      if (editingId) {
        await updateTileCategory(editingId, formData);
        // setSuccessMessage("Category updated successfully!");
      } else {
        await addTileCategory(formData);
        // setSuccessMessage("Category added successfully!");
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong.");
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteTileCategory(item._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({ name: item.name, description: item.description });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const totalPages = Math.ceil(tileCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = tileCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <Helmet>
        <title>Tile Categories - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Manage and submit different tile categories in Lili Tile Customizer."
        />
      </Helmet>

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Tile Categories</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            {successMessage && (
              <p className="mb-4 text-green-600 text-sm">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="mb-4 text-red-600 text-sm">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium">Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full mb-4 border border-gray-300 rounded p-2"
                required
              />
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full mb-4 border border-gray-300 rounded p-2"
              />
              <div className="flex gap-2 flex-wrap ">
                <button
                  type="submit"
                  className="bg-[#BD5B4C] text-white px-4 py-2 rounded text-sm"
                >
                  {editingId ? "Update Category" : "Add New Category"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-300 text-black px-4 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="md:col-span-2 overflow-x-auto whitespace-nowrap">
            <table className="min-w-full bg-white border border-gray-300 rounded text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 border-b text-left">Name</th>
                  <th className="p-4 border-b text-left">Description</th>
                  <th className="p-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-bold">
                {currentItems.map((item, i) => (
                  <tr
                    key={item._id || i}
                    className="border-t group hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-700 font-bold">{item.name}</td>
                    <td className="p-4 text-gray-500">
                      {item.description || "—"}
                    </td>
                    <td className="p-2 space-x-2 text-xs">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination flex justify-center mt-4 space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 border rounded ${
                        page === currentPage ? "bg-[#BD5B4C] text-white" : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TileCategories;
