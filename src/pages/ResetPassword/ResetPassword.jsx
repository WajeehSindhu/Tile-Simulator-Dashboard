import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'

const ResetPassword = () => {
    const { resetPassword, error, message, isLoading } = useAuth();
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }

        try {
            const msg = await resetPassword(token, password, confirmPassword);
            setSuccessMessage(msg || 'Password reset successful!');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (err) {
            // error is handled via context
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 font-poppins">
                        Set a new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 font-poppins">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    {(localError || error) && (
                        <div className="bg-red-50 text-red-500 p-3 rounded text-sm font-poppins">
                            {localError || error}
                        </div>
                    )}
                    {(successMessage || message) && (
                        <div className="bg-green-50 text-green-500 p-3 rounded text-sm font-poppins">
                            {successMessage || message}
                        </div>
                    )}

                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#bd5b4c] focus:border-[#bd5b4c] sm:text-sm font-poppins"
                            placeholder="New password"
                        />
                    </div>

                    <div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#bd5b4c] focus:border-[#bd5b4c] sm:text-sm font-poppins"
                            placeholder="Confirm password"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#bd5b4c] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bd5b4c] font-poppins"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
