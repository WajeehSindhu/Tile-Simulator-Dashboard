import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 14;

const AllTiles = () => {
  const navigate = useNavigate();
  const { 
    tiles,
    fetchTiles,
    deleteTile,
    tileLoading: loading,
    tileError: error
  } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTiles();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil((tiles?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTiles = tiles?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `Published\n${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })} at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase()}`;
  };

  const handleEdit = (tileId) => {
    navigate(`/dashboard/tiles/edit/${tileId}`);
  };

  const handleDelete = async (tileId, tileName) => {
    if (window.confirm(`Are you sure you want to delete "${tileName}"?`)) {
      try {
        await deleteTile(tileId);
        // Adjust current page if needed
        const remainingItems = tiles.length - 1;
        const totalPagesAfterDelete = Math.ceil(remainingItems / ITEMS_PER_PAGE);
        if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
          setCurrentPage(totalPagesAfterDelete);
        }
      } catch (err) {
        console.error('Error deleting tile:', err);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>All Tiles - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Browse and manage all tiles available in the Lili Tile Customizer."
        />
      </Helmet>

      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-start items-start sm:justify-between sm:items-center mb-6 ">
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

        <div className="bg-white rounded-lg shadow  overflow-x-auto whitespace-nowrap custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tile Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#bd5b4c]"></div>
                    </div>
                  </td>
                </tr>
              ) : currentTiles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No tiles found. Add your first tile to get started!
                  </td>
                </tr>
              ) : (
                currentTiles.map((tile) => (
                  <tr key={tile._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 mr-4">
                          <div className="h-full w-full rounded-lg overflow-hidden">
                            {tile.mainMask ? (
                              <div 
                                className="h-full w-full"
                                style={{
                                  backgroundColor: tile.backgroundColor?.noBackground ? 'transparent' : tile.backgroundColor?.hexCode,
                                  backgroundImage: tile.backgroundColor?.noBackground ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' : 'none'
                                }}
                              >
                                <img
                                  src={tile.mainMask}
                                  alt={tile.tileName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'placeholder-image-url';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {tile.tileName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tile.category?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-500">
                      {formatDate(tile.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tile._id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tile._id, tile.tileName)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t">
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
                    currentPage === idx + 1 ? "bg-[#bd5b4c] text-white" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
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

export default AllTiles;
