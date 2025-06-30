import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSubmissions = async () => {
      setLoading(true);
      const response = await fetch('https://lili-tiles.onrender.com/api/tile-submissions');
      const data = await response.json();
      // Find the submission with the matching _id
      const found = data.find(item => item._id === id);
      setSubmission(found);
      setLoading(false);
    };
    fetchAllSubmissions();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!submission) return <div className="p-6 text-red-600">Submission not found.</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-xl">
        <button
          className="mb-6 flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700"
          onClick={() => navigate('/dashboard/submissions')}
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="space-y-3 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-2 gap-x-0 gap-y-3">
            {submission.tilePatternImage && !submission.tilePatternImage.includes('via.placeholder.com/480x480/f0f0f0/666666?text=Tile+Preview') ? (
              <img src={submission.tilePatternImage} alt="Tile Pattern" className="h-[200px] w-[200px] rounded-lg object-cover border" onError={e => { e.target.onerror = null; e.target.src = '/Images/logo.png'; }} />
            ) : (
              <img src="/Images/logo.png" alt="Tile Pattern" className="h-[100px] w-[100px] rounded-lg object-cover border" />
            )}
            {submission.tilePatternBorderImage && !submission.tilePatternBorderImage.includes('via.placeholder.com/480x480/f0f0f0/666666?text=Tile+Preview') ? (
              <img src={submission.tilePatternBorderImage} alt="Tile Pattern Border" className="h-[200px] w-[200px] rounded-lg object-cover border" onError={e => { e.target.onerror = null; e.target.src = '/Images/logo.png'; }} />
            ) : (
              <img src="/Images/logo.png" alt="Tile Pattern Border" className="h-[100px] w-[100px] rounded-lg object-cover border" />
            )}
          </div>
          <div className="space-y-3 text-left mt-6 font-poppins">
            <div><span className="font-semibold">Name:</span> {submission.name || 'none'}</div>
            <div><span className="font-semibold">Mail:</span> {submission.email || 'none'}</div>
            <div><span className="font-semibold">Phone Number:</span> {submission.phoneNumber || 'none'}</div>
            <div><span className="font-semibold">Reference Number:</span> {submission.referenceNumber || 'none'}</div>
            <div><span className="font-semibold">Tile Quantity:</span> {submission.tileQuantity ?? 'none'}</div>
            <div><span className="font-semibold">Tile Size:</span> {submission.tileSize || 'none'}</div>
            <div><span className="font-semibold">Message:</span> {submission.message || 'none'}</div>
            <div><span className="font-semibold">Date:</span> {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'none'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail; 