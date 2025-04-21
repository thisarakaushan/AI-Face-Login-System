'use client';

import { useState, useEffect } from 'react';
import LiveFaceRecognition from '@/components/LiveFaceRecognition';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [faceVerificationActive, setFaceVerificationActive] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem('authToken');
                
                if (!token) {
                    // Redirect to login if no token
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            // Call logout API if needed
            await fetch('http://localhost:5000/api/user/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear auth token and redirect
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
    };

    // Handle face verification success
    const handleFaceVerificationSuccess = async (data) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/user/password', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(prev => ({...prev, password: data.password}));
                setShowPassword(true);
            }
        } catch (error) {
            setError('Failed to fetch password');
        }
        setFaceVerificationActive(false);
    };

    // Handle face verification failure
    const handleFaceVerificationFailure = (data) => {
        setError(data.message || 'Face verification failed');
        setFaceVerificationActive(false);
    };

    // Toggle face verification
    const toggleFaceVerification = () => {
        setFaceVerificationActive(prev => !prev);
        setError(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex justify-center">
                        <svg className="w-12 h-12 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="mt-3 text-center text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex justify-center">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="mt-3 text-center text-gray-600">Not authenticated. Please log in.</p>
                    <div className="mt-6">
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-lg font-medium text-white">User Profile</h2>
                        <p className="mt-1 text-sm text-blue-100">Personal information and account details</p>
                    </div>
                    
                    {error && (
                        <div className="mx-4 my-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-5 sm:p-6">
                        {/* User Image */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-40 h-40 bg-gray-300 rounded-full overflow-hidden shadow-lg">
                                {user.profileImage ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{user.name || 'User'}</h3>
                        </div>

                        {/* User Information */}
                        <div className="col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                                <div className="mt-4 border-t border-gray-200">
                                    <dl className="divide-y divide-gray-200">
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                            <dt className="text-sm font-medium text-gray-500">Password</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                                                {showPassword ? (
                                                    <span>{user.password || '••••••••'}</span>
                                                ) : (
                                                    <span>••••••••</span>
                                                )}
                                                {!showPassword && (
                                                    <button
                                                        onClick={toggleFaceVerification}
                                                        className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
                                                    >
                                                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Show Password
                                                    </button>
                                                )}
                                            </dd>
                                        </div>
                                        {user.createdAt && (
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-500">Account created</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Face Recognition Component */}
                    {faceVerificationActive && (
                        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Your Identity</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                To view your password, please verify your identity using face recognition.
                            </p>
                            <LiveFaceRecognition
                                onSuccess={handleFaceVerificationSuccess}
                                onFailure={handleFaceVerificationFailure}
                                email={user.email}
                                mode="login"
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}