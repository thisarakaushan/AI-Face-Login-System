import LoginForm from '@/components/LoginForm';
// import LiveFaceRecognition from '@/components/LiveFaceRecognition';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <LoginForm />
      {/* <LiveFaceRecognition
        email={email}
        onSuccess={(data) => {
          // Handle successful login (store token, redirect, etc.)
          console.log('Login successful', data);
        }}
        onFailure={(error) => {
          // Handle failed login
          console.error('Login failed', error);
        }}
      /> */}
    </div>
  );
}