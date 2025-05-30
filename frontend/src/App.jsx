import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import MentorDashboard from './pages/mentor/MentorDashboard.jsx';
import AdminPayoutHistory from './pages/admin/AdminPayoutHistory.jsx';
import MentorPayoutHistory from './pages/mentor/MentorPayoutHistory.jsx';
import AdminSessionHistory from './pages/admin/AdminSessionHistory.jsx';
import MentorSessionHistory from './pages/mentor/MentorSessionHistory.jsx';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'users/admin/:adminId/dashboard',
        element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      },
      {
        path: 'users/mentors/:mentorId/dashboard',
        element: <ProtectedRoute><MentorDashboard /></ProtectedRoute>
      },
      {
        path: 'admin/sessions',
        element: <ProtectedRoute><AdminSessionHistory /></ProtectedRoute>
      },
      {
        path: 'admin/payouts',
        element: <ProtectedRoute><AdminPayoutHistory /></ProtectedRoute>
      },
      {
        path: 'mentor/sessions',
        element: <ProtectedRoute><MentorSessionHistory /></ProtectedRoute>
      },
      {
        path: 'mentor/payouts',
        element: <ProtectedRoute><MentorPayoutHistory /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
