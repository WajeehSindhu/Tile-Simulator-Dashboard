import React, { useState } from 'react';

const TileColors = () => {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#000000',
  });

  const handleAddColor = (e) => {
    e.preventDefault();
    if (newColor.name.trim()) {
      setColors([...colors, { id: Date.now(), ...newColor }]);
      setNewColor({ name: '', hex: '#000000' });
    }
  };

  const handleDeleteColor = (id) => {
    setColors(colors.filter((color) => color.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Tile Colors</h1>

      {/* Add Color Form */}
      <form onSubmit={handleAddColor} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newColor.name}
            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
            placeholder="Enter color name"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bd5b4c]"
          />
          <input
            type="color"
            value={newColor.hex}
            onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
            className="w-12 h-10 p-1 border rounded-md cursor-pointer"
          />
          <button
            type="submit"
            className="bg-[#bd5b4c] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Add Color
          </button>
        </div>
      </form>

      {/* Colors List */}
      <div className="bg-white rounded-lg shadow">
        {colors.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No colors found. Add your first color!
          </div>
        ) : (
          <div className="divide-y">
            {colors.map((color) => (
              <div
                key={color.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="font-medium">{color.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteColor(color.id)}
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

export default TileColors;
