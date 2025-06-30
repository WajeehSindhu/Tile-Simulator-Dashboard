import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Mock fetch function (replace with your real API call)
const fetchSubmissions = async () => {
  const response = await fetch('https://lili-tiles.onrender.com/api/tile-submissions');
  if (!response.ok) throw new Error('Failed to fetch submissions');
  const data = await response.json();
  return data.map(item => ({
    id: item._id,
    image: item.tilePatternImage, // or item.tilePatternBorderImage
    name: item.name,
    email: item.email,
    phone: item.phoneNumber,
    quantity: item.tileQuantity,
    quantityUnit: item.tileSize,
    date: item.createdAt,
  }));
};

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 20;

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await fetchSubmissions();
      setSubmissions(data);
      setLoading(false);
    };
    getData();
  }, []);

  const totalPages = Math.ceil(submissions.length / submissionsPerPage);
  const indexOfLastItem = currentPage * submissionsPerPage;
  const indexOfFirstItem = indexOfLastItem - submissionsPerPage;
  const paginatedSubmissions = submissions.length > submissionsPerPage
    ? submissions.slice(indexOfFirstItem, indexOfLastItem)
    : submissions;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(
        "https://lili-tiles.onrender.com/api/tile-submissions/" + id,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        alert("Failed to delete submission: " + (errorData.error || "Unknown error"));
        return;
      }
      // Remove from UI
      setSubmissions(submissions.filter(sub => sub.id !== id));
      alert("Submission deleted successfully!");
    } catch (err) {
      alert("Error deleting submission: " + err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Submissions Table - Lili Tile Customizer</title>
        <meta name="description" content="Submissions table view." />
      </Helmet>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Submissions</h1>
        <div className="bg-white rounded-lg shadow overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 font-poppins font-li">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y font-poppins divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center p-6">Loading...</td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-6 text-gray-500">No submissions found.</td>
                </tr>
              ) : (
                paginatedSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex gap-1">
                        <img src={item.image} alt="avatar" className="h-16 w-16 rounded-lg object-cover border" />
                      </div>
                    </td>
                    <td className="p-4 text-blue-700 font-semibold whitespace-nowrap">{item.name}</td>
                    <td className="p-4 whitespace-nowrap">{item.email}</td>
                    <td className="p-4 whitespace-nowrap">{item.phone}</td>
                    <td className="p-4 whitespace-nowrap">
                      Published<br />
                      {new Date(item.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} at {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => navigate(`/dashboard/submissions/${item.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {!loading && submissions.length > submissionsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-4 p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`px-3 py-1 border rounded hover:bg-gray-100 ${currentPage === idx + 1 ? 'bg-[#bd5b4c] text-white' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Submissions;