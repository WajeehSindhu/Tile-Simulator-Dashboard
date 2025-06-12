import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tilesubmissions');
        setSubmissions(res.data); // Adjust if your API returns data inside a nested object
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <>
      <Helmet>
        <title>Submission - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Submit a new tile or update existing tiles in the Lili Tile Customizer."
        />
      </Helmet>

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Tile Submissions</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">
                      <input type="checkbox" />
                    </th>
                    <th className="p-3">Image</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">Referer</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">
                        <img
                          src={submission.imageUrl || "https://via.placeholder.com/64"}
                          alt="Tile"
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-3 font-medium text-blue-600">{submission.name}</td>
                      <td className="p-3">{submission.email}</td>
                      <td className="p-3">{submission.phone}</td>
                      <td className="p-3">{submission.referer || 'N/A'}</td>
                      <td className="p-3">{submission.quantity}</td>
                      <td className="p-3">{submission.unit || 'Sqft.'}</td>
                      <td className="p-3">{new Date(submission.date).toLocaleString()}</td>
                      <td className="p-3 space-x-2">
                        <button className="text-blue-600 hover:underline">View</button>
                        <button className="text-green-600 hover:underline">Approve</button>
                        <button className="text-red-600 hover:underline">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Submissions;
