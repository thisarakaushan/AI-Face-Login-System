// Login Form Component
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LiveFaceRecognition from '@/components/LiveFaceRecognition';

export default function LoginForm() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'face'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validate form
            if (!email) {
                throw new Error('Email is required');
            }

            if (loginMethod === 'password' && !password) {
                throw new Error('Password is required');
            }

            // Prepare login data
            const loginData = {
                method: loginMethod,
                email: email
            };

            if (loginMethod === 'password') {
                loginData.password = password;
            }

            // Send login request
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token to localStorage
            localStorage.setItem('authToken', data.token);

            setSuccess('Login successful! Redirecting...');

            // Redirect to dashboard or home page
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFaceLoginSuccess = async (data) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: 'face',
                    email: email
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            // Save token and redirect
            localStorage.setItem('authToken', result.token);
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err) {
            setError(err.message);
        }
    };

    const handleFaceLoginFailure = (error) => {
        setError(error.message || 'Face verification failed');
    };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Welcome Back
                </h2>
                <p className="text-gray-600 text-sm">Sign in to your account</p>
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

            {/* Login method tabs */}
            <div className="flex mb-8 bg-gray-50 rounded-lg p-1">
                <button
                    className={`flex-1 py-2.5 px-4 rounded-md transition-all duration-200 ${loginMethod === 'password'
                            ? 'bg-white shadow-sm text-blue-600 font-semibold'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                    onClick={() => setLoginMethod('password')}
                >
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Password</span>
                    </span>
                </button>
                <button
                    className={`flex-1 py-2.5 px-4 rounded-md transition-all duration-200 ${loginMethod === 'face'
                            ? 'bg-white shadow-sm text-blue-600 font-semibold'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                    onClick={() => setLoginMethod('face')}
                >
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Face Recognition</span>
                    </span>
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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

                {/* Password method fields */}
                {loginMethod === 'password' && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                )}

                {/* Face recognition method */}
                {loginMethod === 'face' && (
                    <div className="flex justify-center">
                        <LiveFaceRecognition
                            email={email}
                            mode="login"
                            onSuccess={handleFaceLoginSuccess}
                            onFailure={handleFaceLoginFailure}
                        />
                    </div>
                )}

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
                            Logging in...
                        </span>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}