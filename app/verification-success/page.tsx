import Link from 'next/link';

export default function VerificationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verified</h2>
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <p className="text-center">
              Your email has been successfully verified!
            </p>
          </div>
          <p className="mt-4 text-gray-600">
            {`If you're a faculty member or student, an admin will need to approve your account before you can log in. You'll receive an email when your account is approved.`}
          </p>
          <div className="mt-8">
            <Link href="/login" className="font-medium text-lg text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
