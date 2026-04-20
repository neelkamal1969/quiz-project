import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Page Imports
import HomePage from './Pages/HomePage';
import ValueToQuestions from './Pages/ValueToQuestions';
import PhotoToQuestions from './Pages/PhotoToQuestions';
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import ProfileSetup from './Pages/ProfileSetup';
import Vault from './Pages/Vault';
import AdminLogs from './Pages/AdminLogs';

// Component Imports
import Header from './components/Header';

export default function App() {
  // Define all application routes using createBrowserRouter
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Header />
          <HomePage />
        </>
      ),
    },
    {
      path: '/valueInput',
      element: (
        <>
          <Header />
          <ValueToQuestions />
        </>
      ),
    },
    {
      path: '/imageInput',
      element: (
        <>
          <Header />
          <PhotoToQuestions />
        </>
      ),
    },
    {
      path: '/signup',
      element: (
        <>
          <Header />
          <SignUpPage />
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <Header />
          <LoginPage />
        </>
      ),
    },
    {
      path: '/profile-setup',
      element: (
        <>
          <Header />
          <ProfileSetup />
        </>
      ),
    },
    {
      path: '/myQuestions',
      element: (
        <>
          <Header />
          <Vault />
        </>
      ),
    },
    {
      path: '/AdminLogs',
      element: (
        <>
          <Header />
          <AdminLogs />
        </>
      ),
    },
  ]);

  return (
    <div>
      {/* RouterProvider renders the active route based on the current URL */}
      <RouterProvider router={router} />
    </div>
  );
}