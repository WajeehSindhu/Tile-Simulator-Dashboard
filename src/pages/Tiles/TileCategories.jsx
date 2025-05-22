import React, { useState } from 'react';

const TileCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCategory.trim() }]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Tile Categories</h1>

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
          />
          <button
            type="submit"
            className="bg-[#bd5b4c] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Add Category
          </button>
        </div>
      </form>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found. Add your first category!
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-medium">{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TileCategories;
