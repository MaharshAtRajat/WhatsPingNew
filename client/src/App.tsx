import React from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Submissions from './pages/Submissions';
import PrivateRoute from './components/PrivateRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/forms/new" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
      <Route path="/forms/:formId/edit" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
      <Route path="/forms/:formId/submissions" element={<PrivateRoute><Submissions /></PrivateRoute>} />
      <Route path="/forms/:formId" element={<FormView />} />
      <Route path="/s/:shortUrl" element={<FormView />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ChakraProvider>
        <CSSReset />
        <AuthProvider>
          <Navbar />
          <AppRoutes />
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
};

export default App; 