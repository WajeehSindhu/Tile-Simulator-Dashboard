import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

const AllTiles = () => {
  const { 
    tiles,
    fetchTiles,
    deleteTile,
    tileLoading: loading,
    tileError: error
  } = useAuth();

  useEffect(() => {
    // Comment out fetchTiles() until API is implemented
    // fetchTiles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tile?')) {
      try {
        await deleteTile(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Remove loading check since we're not fetching yet
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bd5b4c]"></div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Helmet>
        <title>All Tiles - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Browse and manage all tiles available in the Lili Tile Customizer."
        />
      </Helmet>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">All Tiles</h1>
          <Link
            to="/dashboard/tiles/add"
            className="bg-[#bd5b4c] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Add New Tile
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Show message about implementing API */}
          <div className="col-span-full text-center py-8 text-gray-500">
            <p className="mb-2">API endpoint not implemented yet.</p>
            <p>Please implement the GET /api/tiles endpoint in your backend to see tiles here.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllTiles;
