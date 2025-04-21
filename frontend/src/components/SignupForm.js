// Signup form component
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FaceCapture from './FaceCapture';

export default function SignupForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [useFaceAuth, setUseFaceAuth] = useState(false);
    const [faceImage, setFaceImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle signup form submission
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validate form
            if (!email) {
                throw new Error('Email is required');
            }

            // Either password or face auth is required
            if (!password && !useFaceAuth) {
                throw new Error('You must set up at least one authentication method');
            }

            if (password && password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            if (password && password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (useFaceAuth && !faceImage) {
                throw new Error('Face capture is required for face authentication');
            }

            // Prepare signup data
            const signupData = {
                email: email
            };

            if (password) {
                signupData.password = password;
            }

            if (useFaceAuth && faceImage) {
                signupData.faceImage = faceImage;
            }

            // Send signup request
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess('Account created successfully! Redirecting to login...');

            // Redirect to login page
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle face capture
    const handleFaceCapture = (imageData) => {
        setFaceImage(imageData);
    };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Create Account
                </h2>
                <p className="text-gray-600 text-sm">Join us today and secure your access</p>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="mb-6 p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
                {/* Email field */}
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                {/* Password section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">Password Authentication</h3>
                        <div className="h-px flex-1 bg-gray-200 mx-3"></div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Face authentication section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">Face Authentication</h3>
                        <div className="h-px flex-1 bg-gray-200 mx-3"></div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="useFaceAuth"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={useFaceAuth}
                            onChange={(e) => setUseFaceAuth(e.target.checked)}
                            disabled={loading}
                        />
                        <label htmlFor="useFaceAuth" className="ml-3 text-sm font-medium text-gray-700">
                            Enable Face Authentication
                        </label>
                    </div>

                    {useFaceAuth && (
                        <div className="mt-3 flex justify-center">
                            <FaceCapture onCapture={handleFaceCapture} buttonText="Capture Face for Signup" />
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}