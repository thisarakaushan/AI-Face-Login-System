import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Face Auth System
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Secure authentication with facial recognition
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col space-y-4 mt-8">
          <Link 
            href="/login" 
            className="group relative w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></span>
            Login
          </Link>
          
          <Link 
            href="/signup" 
            className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-800 font-semibold rounded-lg text-center transition-all duration-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
          >
            Sign Up
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            State-of-the-art facial recognition technology
          </p>
        </div>
      </div>
    </div>
  );
}