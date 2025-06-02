// import { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import axios from "axios";

// const ITEMS_PER_PAGE = 14;

// const TileCategories = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//   });
//   const [successMessage, setSuccessMessage] = useState("");
//   const [items, setItems] = useState([]);
//   const [checkedItems, setCheckedItems] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/categories");
//       setItems(res.data);
//       setCheckedItems(new Array(res.data.length).fill(false));
//       setCurrentPage(1);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) {
//       alert("Name is required");
//       return;
//     }

//     try {
//       if (isEditing) {
//         await axios.put(`http://localhost:5000/api/categories/${editId}`, formData);
//         setSuccessMessage("Category updated successfully!");
//       } else {
//         await axios.post("http://localhost:5000/api/categories", formData);
//         setSuccessMessage("Category added successfully!");
//       }

//       setFormData({ name: "", description: "" });
//       setIsEditing(false);
//       setEditId(null);
//       fetchCategories();
//     } catch (error) {
//       console.error("Error saving category:", error);
//       alert("Failed to save category. Please check the console.");
//     }
//   };

//   const handleSelectAll = (e) => {
//     const checked = e.target.checked;
//     setCheckedItems(new Array(items.length).fill(checked));
//   };

//   const handleCheck = (index) => (e) => {
//     const updatedChecked = [...checkedItems];
//     updatedChecked[index] = e.target.checked;
//     setCheckedItems(updatedChecked);
//   };

//   const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//   const allChecked = checkedItems.length > 0 && checkedItems.every(Boolean);
//   const someChecked = checkedItems.some(Boolean) && !allChecked;

//   const goToPage = (page) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//   };

//   const handleEdit = (item) => {
//     setFormData({ name: item.name, description: item.description });
//     setIsEditing(true);
//     setEditId(item._id);
//   };

//   const handleDelete = async (item) => {
//     if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/categories/${item._id}`);
//       fetchCategories();
//     } catch (error) {
//       console.error("Error deleting category:", error);
//       alert("Failed to delete category.");
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Tile Categories - Lili Tile Customizer</title>
//         <meta
//           name="description"
//           content="Manage and submit different tile categories in Lili Tile Customizer."
//         />
//       </Helmet>

//       <div className="p-6 bg-gray-100 min-h-screen">
//         <h1 className="text-2xl font-semibold mb-4">Tile Categories</h1>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Form */}
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-lg font-medium mb-4">
//               {isEditing ? "Edit Category" : "Add New Category"}
//             </h2>

//             {successMessage && (
//               <p className="mb-4 text-green-600 text-sm">{successMessage}</p>
//             )}

//             <form onSubmit={handleSubmit}>
//               <label className="block mb-2 text-sm font-medium">Name</label>
//               <input
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full mb-4 border border-gray-300 rounded p-2"
//                 required
//               />
//               <p className="text-xs text-gray-500 mb-4">
//                 The name is how it appears on your site.
//               </p>

//               <label className="block mb-2 text-sm font-medium">Description</label>
//               <textarea
//                 name="description"
//                 rows="4"
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="w-full mb-4 border border-gray-300 rounded p-2"
//               />
//               <p className="text-xs text-gray-500 mb-4">
//                 The description is not prominent by default; however, some themes may show it.
//               </p>

//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
//               >
//                 {isEditing ? "Update Category" : "Add New Category"}
//               </button>
//             </form>
//           </div>

//           {/* Table */}
//           <div className="md:col-span-2">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <select className="border border-gray-300 p-2 rounded mr-2 text-sm">
//                   <option>Bulk actions</option>
//                   <option>Delete</option>
//                 </select>
//                 <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
//                   Apply
//                 </button>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   type="text"
//                   placeholder=""
//                   className="border border-gray-300 p-2 rounded text-sm mr-2"
//                 />
//                 <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
//                   Search Categories
//                 </button>
//               </div>
//             </div>

//             <table className="min-w-full bg-white border border-gray-300 rounded text-sm">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2 border-b">
//                     <input
//                       type="checkbox"
//                       checked={allChecked}
//                       ref={(input) => {
//                         if (input) input.indeterminate = someChecked;
//                       }}
//                       onChange={handleSelectAll}
//                     />
//                   </th>
//                   <th className="p-4 border-b text-left">Name</th>
//                   <th className="p-4 border-b text-left">Description</th>
//                 </tr>
//               </thead>
//               <tbody className="text-bold">
//                 {currentItems.map((item, i) => (
//                   <tr key={item._id || i} className="border-t group hover:bg-gray-50">
//                     <td className="py-4 ps-4">
//                       <input
//                         type="checkbox"
//                         checked={checkedItems[startIndex + i]}
//                         onChange={handleCheck(startIndex + i)}
//                       />
//                     </td>
//                     <td className="p-2 text-blue-600 font-bold relative">
//                       <div className="flex items-center justify-between">
//                         <span>{item.name}</span>
//                         <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2 text-xs">
//                           <button
//                             className="text-blue-600 hover:underline"
//                             onClick={() => handleEdit(item)}
//                           >
//                             Edit
//                           </button>
//                           <button
//                             className="text-red-600 hover:underline"
//                             onClick={() => handleDelete(item)}
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-2 text-gray-500">{item.description || "—"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {totalPages > 1 && (
//               <div className="pagination flex justify-center mt-4 space-x-2">
//                 <button
//                   onClick={() => goToPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Prev
//                 </button>

//                 {[...Array(totalPages)].map((_, idx) => {
//                   const page = idx + 1;
//                   return (
//                     <button
//                       key={page}
//                       onClick={() => goToPage(page)}
//                       className={`px-3 py-1 border rounded ${
//                         page === currentPage ? "bg-blue-500 text-white" : ""
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   );
//                 })}

//                 <button
//                   onClick={() => goToPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TileCategories;
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const ITEMS_PER_PAGE = 14;

const TileCategories = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  // Fetch categories on mount and after updates
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setItems(res.data);
      setCheckedItems(new Array(res.data.length).fill(false));
      setCurrentPage(1);
      setSuccessMessage("");
      setErrorMessage("");
      setEditingId(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      setErrorMessage("Failed to fetch categories.");
      console.error(error);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit new category or update existing one
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        await axios.put(
          `http://localhost:5000/api/categories/${editingId}`,
          formData
        );
        setSuccessMessage("Category updated successfully!");
      } else {
        // Create new
        await axios.post("http://localhost:5000/api/categories", formData);
        setSuccessMessage("Category added successfully!");
      }

      fetchCategories();
    } catch (error) {
      setErrorMessage("Failed to save category.");
      console.error(error);
    }
  };

  // Select all checkboxes
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setCheckedItems(new Array(items.length).fill(checked));
  };

  // Select individual checkbox
  const handleCheck = (index) => (e) => {
    const updatedChecked = [...checkedItems];
    updatedChecked[index] = e.target.checked;
    setCheckedItems(updatedChecked);
  };

  // Pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const allChecked = checkedItems.length > 0 && checkedItems.every(Boolean);
  const someChecked = checkedItems.some(Boolean) && !allChecked;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Delete a single category
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/categories/${item._id}`);
      setSuccessMessage("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      setErrorMessage("Failed to delete category.");
      console.error(error);
    }
  };

  // Bulk delete selected categories
  const handleBulkDelete = async () => {
    const idsToDelete = items
      .filter((_, i) => checkedItems[i])
      .map((item) => item._id);

    if (idsToDelete.length === 0) {
      alert("No categories selected for deletion.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${idsToDelete.length} categories?`
      )
    )
      return;

    try {
      // Make parallel delete requests
      await Promise.all(
        idsToDelete.map((id) =>
          axios.delete(`http://localhost:5000/api/categories/${id}`)
        )
      );
      setSuccessMessage("Selected categories deleted successfully!");
      fetchCategories();
    } catch (error) {
      setErrorMessage("Failed to delete selected categories.");
      console.error(error);
    }
  };

  // Start editing a category
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({ name: item.name, description: item.description || "" });
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setSuccessMessage("");
    setErrorMessage("");
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
              <p className="text-xs text-gray-500 mb-4">
                The name is how it appears on your site.
              </p>

              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full mb-4 border border-gray-300 rounded p-2"
              />
              <p className="text-xs text-gray-500 mb-4">
                The description is not prominent by default; however, some themes
                may show it.
              </p>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
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
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <select className="border border-gray-300 p-2 rounded mr-2 text-sm">
                  <option>Bulk actions</option>
                  <option>Delete</option>
                </select>
                <button
                  onClick={handleBulkDelete}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                {/* Placeholder for search */}
                <input
                  type="text"
                  placeholder="Search Categories (not implemented)"
                  className="border border-gray-300 p-2 rounded text-sm mr-2"
                  disabled
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                  disabled
                >
                  Search Categories
                </button>
              </div>
            </div>

            <table className="min-w-full bg-white border border-gray-300 rounded text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border-b">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(input) => {
                        if (input) input.indeterminate = someChecked;
                      }}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                    <td className="py-4 ps-4">
                      <input
                        type="checkbox"
                        checked={checkedItems[startIndex + i]}
                        onChange={handleCheck(startIndex + i)}
                      />
                    </td>
                    <td className="p-2 text-blue-600 font-bold">{item.name}</td>
                    <td className="p-2 text-gray-500">{item.description || "—"}</td>
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
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination controls */}
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
                        page === currentPage ? "bg-blue-500 text-white" : ""
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
