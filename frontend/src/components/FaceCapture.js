// Face capture component
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export default function FaceCapture({ onCapture, buttonText = "Capture Face" }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    // Start camera stream
    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCapturing(true);
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
            setIsCapturing(false);
        }
    }, [stream]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Capture photo from the camera
    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get data URL from canvas
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);

            // Pass image to parent component
            if (onCapture) {
                onCapture(imageDataUrl);
            }

            // Stop camera stream
            stopCamera();
        }
    }, [onCapture, stopCamera]);

    // Reset and start over
    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

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

            {/* Preview area */}
            <div className="relative w-full max-w-md overflow-hidden bg-gray-900 rounded-xl shadow-lg transition-all duration-300">
                <div className="aspect-video relative">
                    {!capturedImage ? (
                        <video
                            ref={videoRef}
                            className={`w-full h-full object-cover ${isCapturing ? 'block' : 'hidden'}`}
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {!isCapturing && !capturedImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-300 font-medium">Camera not active</p>
                            <p className="text-gray-400 text-sm">Click the button below to start</p>
                        </div>
                    )}

                    {/* Status indicator */}
                    {isCapturing && (
                        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-medium">Recording</span>
                        </div>
                    )}

                    {/* Hidden canvas for capturing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 space-y-3 w-full max-w-md">
                {!isCapturing && !capturedImage && (
                    <button
                        onClick={startCamera}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Start Camera</span>
                    </button>
                )}

                {isCapturing && (
                    <button
                        onClick={capturePhoto}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{buttonText}</span>
                    </button>
                )}

                {capturedImage && (
                    <button
                        onClick={retakePhoto}
                        className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retake Photo</span>
                    </button>
                )}
            </div>
        </div>
    );
}