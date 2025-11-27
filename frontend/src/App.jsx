import { Routes, Route, Navigate } from 'react-router-dom'
import PortalPaciente from './PortalPaciente' 
import './App.css' 
import Login from './Login';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import UserForm from './UserForm'; 
import ResponderForm from './ResponderForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rotas Públicas */}
      <Route path="/portal/:userId" element={<PortalPaciente />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Privadas (Admin) */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Gestão de Pacientes */}
      <Route path="/admin/user/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
      <Route path="/admin/user/edit/:userId" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
      
      {/* Gestão de Socorristas */}
      <Route path="/admin/responder/new" element={<ProtectedRoute><ResponderForm /></ProtectedRoute>} />
      <Route path="/admin/responder/edit/:responderId" element={<ProtectedRoute><ResponderForm /></ProtectedRoute>} />
    </Routes>
  )
}

export default App