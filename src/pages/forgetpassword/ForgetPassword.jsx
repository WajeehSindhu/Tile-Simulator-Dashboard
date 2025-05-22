import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Add your password reset logic here
      // For now, we'll just simulate a successful request
      console.log('Password reset requested for:', email);
      setMessage('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-poppins">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-poppins">
            Enter your email address and we'll send you instructions to reset your
            password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm font-poppins">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-500 p-3 rounded text-sm font-poppins">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only font-poppins">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#bd5b4c] focus:border-[#bd5b4c] focus:z-10 sm:text-sm font-poppins"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#bd5b4c] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bd5b4c] font-poppins"
            >
              Send reset instructions
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/signin"
              className="font-medium text-[#bd5b4c] hover:text-red-700 font-poppins"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
