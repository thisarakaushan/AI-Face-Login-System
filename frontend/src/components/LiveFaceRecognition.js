'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function LiveFaceRecognition({ 
    onSuccess, 
    onFailure, 
    email, 
    mode = 'login', // 'login' or 'reset-password'
    onPasswordReset,
    newPassword // Only needed for reset-password mode
}) {
    // Refs for video and canvas elements
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    // State variables
    const [stream, setStream] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognitionStatus, setRecognitionStatus] = useState(null); // null, 'success', 'failure'
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [faceDetected, setFaceDetected] = useState(false);
    
    // Animation frame reference
    const requestAnimationFrameRef = useRef(null);

    // Start camera stream
    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsActive(true);
            }
        } catch (err) {
            setError("Could not access camera. Please ensure your camera is connected and permissions are granted.");
            console.error("Error accessing camera:", err);
        }
    }, []);

    // Stop camera stream
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsActive(false);
        }
        
        // Cancel any ongoing animation frame
        if (requestAnimationFrameRef.current) {
            cancelAnimationFrame(requestAnimationFrameRef.current);
            requestAnimationFrameRef.current = null;
        }
    }, [stream]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Extract a frame from video
    const extractFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get data URL from canvas
        return canvas.toDataURL('image/jpeg');
    }, []);

    // Verify face with backend
    const verifyFace = useCallback(async (imageDataUrl) => {
        try {
            setIsProcessing(true);
            
            // First verify the face
            const verifyResponse = await fetch('http://localhost:5000/api/face/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    faceImage: imageDataUrl
                })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success && verifyData.match) {
                setRecognitionStatus('success');
                setStatusMessage('Face recognized! Logging in...');
                if (onSuccess) onSuccess(verifyData);
                stopCamera();
            } else {
                setRecognitionStatus('failure');
                setStatusMessage(verifyData.message || 'Face verification failed');
                if (onFailure) onFailure({ message: 'Face verification failed' });
                
                setTimeout(() => {
                    setRecognitionStatus(null);
                    setStatusMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setRecognitionStatus('failure');
            setStatusMessage('Error connecting to server');
            if (onFailure) onFailure({ success: false, message: 'Connection error' });
            
            setTimeout(() => {
                setRecognitionStatus(null);
                setStatusMessage('');
            }, 3000);
        } finally {
            setIsProcessing(false);
        }
    }, [email, onSuccess, onFailure, stopCamera]);

    // Process video frame for face detection
    const processVideoFrame = useCallback(() => {
        if (!isActive || isProcessing || !email) {
            requestAnimationFrameRef.current = requestAnimationFrame(processVideoFrame);
            return;
        }

        const imageDataUrl = extractFrame();
        
        if (imageDataUrl) {
            fetch('http://localhost:5000/api/face/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    faceImage: imageDataUrl
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    if (data.match) {
                        setFaceDetected(true);
                        // Draw green rectangle for matched face
                        ctx.strokeStyle = '#00FF00';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(50, 50, canvasRef.current.width - 100, canvasRef.current.height - 100);
                        
                        // Add recognition text
                        ctx.fillStyle = '#00FF00';
                        ctx.font = 'bold 24px Arial';
                        ctx.fillText('Face Recognized!', 60, 40);
                        
                        // Trigger automatic login after short delay
                        setTimeout(() => {
                            setStatusMessage('Face recognized! Logging in...');
                            setRecognitionStatus('success');
                            onSuccess(data);
                            stopCamera();
                        }, 1000);
                    } else {
                        setFaceDetected(false);
                        // Draw red rectangle for unmatched face
                        ctx.strokeStyle = '#FF0000';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(50, 50, canvasRef.current.width - 100, canvasRef.current.height - 100);
                        ctx.fillStyle = '#FF0000';
                        ctx.font = 'bold 24px Arial';
                        ctx.fillText('Face Not Recognized', 60, 40);
                    }
                }
            })
            .catch(err => {
                console.error('Error during face detection:', err);
            });
        }
        
        requestAnimationFrameRef.current = requestAnimationFrame(processVideoFrame);
    }, [isActive, isProcessing, email, extractFrame, onSuccess, stopCamera]);

    // Start face recognition
    const startFaceRecognition = useCallback(() => {
        startCamera();
        
        // Start processing video frames once camera is active
        const checkCameraReady = () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                requestAnimationFrameRef.current = requestAnimationFrame(processVideoFrame);
            } else {
                setTimeout(checkCameraReady, 100);
            }
        };
        
        checkCameraReady();
    }, [startCamera, processVideoFrame]);

    // Stop face recognition
    const stopFaceRecognition = useCallback(() => {
        stopCamera();
        setFaceDetected(false);
        setRecognitionStatus(null);
        setStatusMessage('');
    }, [stopCamera]);

    return (
        <div className="flex flex-col items-center w-full">
            {error && (
                <div className="w-full p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Status message */}
            {statusMessage && (
                <div className={`w-full p-4 mb-4 text-sm rounded-lg border flex items-center space-x-2 ${
                    recognitionStatus === 'success' 
                        ? 'text-green-700 bg-green-50 border-green-200' 
                        : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                    {recognitionStatus === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Preview area */}
            <div className="relative w-full max-w-md overflow-hidden bg-gray-900 rounded-xl shadow-lg transition-all duration-300">
                <div className="aspect-video relative">
                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
                        autoPlay
                        playsInline
                        muted
                    />

                    {/* Canvas overlay for face detection visualization */}
                    <canvas 
                        ref={canvasRef}
                        className={`absolute top-0 left-0 w-full h-full ${isActive ? 'block' : 'hidden'}`}
                    />

                    {!isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-300 font-medium">Face Recognition</p>
                            <p className="text-gray-400 text-sm">Click the button below to start</p>
                        </div>
                    )}

                    {/* Face detection indicator */}
                    {isActive && faceDetected && (
                        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-500/70 rounded-full px-3 py-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-white text-xs font-medium">Face Detected</span>
                        </div>
                    )}

                    {/* Status indicator */}
                    {isActive && (
                        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-medium">Live</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 space-y-3 w-full max-w-md">
                {!isActive ? (
                    <button
                        onClick={startFaceRecognition}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center space-x-2"
                        disabled={isProcessing}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Start Face Recognition</span>
                    </button>
                ) : (
                    <button
                        onClick={stopFaceRecognition}
                        className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center space-x-2"
                        disabled={isProcessing}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Stop Camera</span>
                    </button>
                )}
            </div>
        </div>
    );
}