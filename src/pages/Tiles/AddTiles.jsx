import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

const AddTiles = () => {
  const navigate = useNavigate();
  const { addTile, tileLoading, tileError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    price: '',
    description: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('color', formData.color);
      data.append('price', formData.price);
      data.append('description', formData.description);
      if (formData.image) data.append('images', formData.image); // must match multer field name on backend

      await addTile(data);

      // On success, navigate to tiles list
      navigate('/dashboard/tiles');
    } catch (err) {
      // Error is handled in context (tileError)
      console.error(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Tiles - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Add new tiles to customize your design in Lili Tile Customizer."
        />
      </Helmet>

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Add New Tile</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl bg-white rounded-lg shadow p-6"
          encType="multipart/form-data"
        >
          <div className="space-y-4">
            {/* Tile Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tile Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                required
              >
                <option value="">Select a category</option>
                {/* TODO: Populate categories dynamically or hardcode here */}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                required
              >
                <option value="">Select a color</option>
                {/* TODO: Populate colors dynamically or hardcode here */}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
              />
            </div>

            {/* Tile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
                required
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={tileLoading}
              className={`${
                tileLoading ? 'opacity-50 cursor-not-allowed' : ''
              } bg-[#bd5b4c] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors`}
            >
              {tileLoading ? 'Adding...' : 'Add Tile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/tiles')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Show error from context */}
          {tileError && (
            <p className="mt-4 text-red-600 font-medium text-center">{tileError}</p>
          )}
        </form>
      </div>
    </>
  );
};

export default AddTiles;
