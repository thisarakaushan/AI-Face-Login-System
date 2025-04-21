'use client';

import { useState } from 'react';
import LiveFaceRecognition from './LiveFaceRecognition';

export default function ForgotPassword() {
    const [step, setStep] = useState('method-select'); // method-select, email, face, code-verify, new-password
    const [email, setEmail] = useState('');
    const [resetMethod, setResetMethod] = useState('email');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFaceVerificationSuccess = async (data) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    method: 'face',
                    faceImage: data.faceImage
                })
            });

            const result = await response.json();
            if (result.success) {
                setSuccess('Face verified! Please check your email for verification code.');
                setStep('code-verify');
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (err) {
            setError('Failed to verify face');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (step === 'method-select') {
                setStep(resetMethod);
            } 
            else if (step === 'email' || step === 'face') {
                const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, method: resetMethod })
                });
                const data = await response.json();
                if (data.success) {
                    setStep('code-verify');
                    setSuccess('Please check your email for verification code.');
                }
            }
            else if (step === 'code-verify') {
                const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code: verificationCode })
                });
                const data = await response.json();
                if (data.success) {
                    setStep('new-password');
                }
            }
            else if (step === 'new-password') {
                const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email,
                        code: verificationCode,
                        newPassword 
                    })
                });
                const data = await response.json();
                if (data.success) {
                    setSuccess('Password reset successful! Please login with your new password.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl">
            {/* Status Messages */}
            {error && <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 text-green-700 bg-green-100 rounded">{success}</div>}

            {step === 'method-select' && (
                <>
                    <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
                    <div className="space-y-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setResetMethod('email')}
                                className={`flex-1 p-4 rounded ${resetMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                            >
                                Email Reset
                            </button>
                            <button
                                onClick={() => setResetMethod('face')}
                                className={`flex-1 p-4 rounded ${resetMethod === 'face' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                            >
                                Face Recognition
                            </button>
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded"
                        />
                        <button
                            onClick={handleSubmit}
                            className="w-full p-3 bg-blue-500 text-white rounded"
                        >
                            Continue
                        </button>
                    </div>
                </>
            )}

            {step === 'face' && (
                <LiveFaceRecognition
                    email={email}
                    mode="reset-password"
                    onSuccess={handleFaceVerificationSuccess}
                    onFailure={(err) => setError(err.message)}
                />
            )}

            {step === 'code-verify' && (
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">Enter Verification Code</h2>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                        placeholder="Enter verification code"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded"
                        disabled={loading}
                    >
                        Verify Code
                    </button>
                </form>
            )}

            {step === 'new-password' && (
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">Set New Password</h2>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                        placeholder="Enter new password"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded"
                        disabled={loading}
                    >
                        Reset Password
                    </button>
                </form>
            )}
        </div>
    );
}
