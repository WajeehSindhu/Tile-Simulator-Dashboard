import React from 'react';
import { Link } from 'react-router-dom';

const AllTiles = () => {
  const tiles = []; // This will be populated from your data source

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Tiles</h1>
        <Link
          to="/dashboard/add-tile"
          className="bg-[#bd5b4c] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Add New Tile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tiles.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No tiles found. Add your first tile!
          </div>
        ) : (
          tiles.map((tile) => (
            <div key={tile.id} className="bg-white rounded-lg shadow p-4">
              <div className="aspect-square mb-4 bg-gray-100 rounded">
                {tile.image && (
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <h3 className="font-semibold mb-2">{tile.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{tile.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#bd5b4c] font-medium">${tile.price}</span>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllTiles;
