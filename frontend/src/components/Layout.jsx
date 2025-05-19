import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Clock, DollarSign, Calendar, BarChart } from 'lucide-react';

function Layout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {isLandingPage ? (
        <div className="landing-page">
          {/* Hero Section */}
          <section className="bg-indigo-600 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Streamline Your Mentoring Business
                </h1>
                <p className="text-xl md:text-2xl mb-8">
                  Professional platform for managing sessions, tracking hours, and receiving secure payouts
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="/register"
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Join as Mentor
                  </a>
                  <a
                    href="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Professional Tools for Mentors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Clock className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Session Tracking</h3>
                  <p className="text-gray-600">
                    Automatically track and log your mentoring sessions with precision
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <DollarSign className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Secure Payouts</h3>
                  <p className="text-gray-600">
                    Get paid reliably for your sessions with transparent payment tracking
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Calendar className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
                  <p className="text-gray-600">
                    Efficiently manage your mentoring schedule and availability
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <BarChart className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-gray-600">
                    Track your earnings and session statistics in real-time
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-gray-100 py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3">For Mentors</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Automated session tracking and verification</li>
                    <li>• Transparent payment processing</li>
                    <li>• Detailed earnings reports</li>
                    <li>• Professional scheduling tools</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3">For Administrators</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Comprehensive mentor management</li>
                    <li>• Automated payout processing</li>
                    <li>• Session verification system</li>
                    <li>• Detailed financial reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Mentoring Business?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join our platform and experience professional session management and reliable payouts
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="/register"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Register as Mentor
                </a>
                <a
                  href="/login"
                  className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                >
                  Admin Login
                </a>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}

export default Layout; 