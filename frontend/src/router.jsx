// src/router.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/home';
// import other pages when needed (e.g., About, Contact, CarDetails)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  // Add more routes like this:
  // {
  //   path: '/about',
  //   element: <About />,
  // },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
