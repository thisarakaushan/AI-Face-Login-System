import ResetPasswordForm from '@/components/ResetPasswordForm';
// import LiveFaceRecognition from '@/components/LiveFaceRecognition';

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <ResetPasswordForm />
      {/* <LiveFaceRecognition
        email={email}
        mode="reset-password"
        newPassword={newPassword}
        onPasswordReset={(data) => {
          // Handle successful password reset
          console.log('Password reset successful', data);
        }}
        onFailure={(error) => {
          // Handle failed reset
          console.error('Password reset failed', error);
        }}
      /> */}
    </div>
  );
}