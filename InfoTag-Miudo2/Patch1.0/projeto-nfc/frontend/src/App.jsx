import { Routes, Route } from 'react-router-dom'
import PortalPaciente from './PortalPaciente' 
import './App.css' 
import Login from './Login';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import UserForm from './UserForm'; // <-- 1. Importe o formulário

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/portal/:userId" element={<PortalPaciente />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Privadas (Dashboard) */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      {/* 2. Rota para NOVO usuário */}
      <Route 
        path="/admin/user/new" 
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        } 
      />
      {/* 3. Rota para EDITAR usuário */}
      <Route 
        path="/admin/user/edit/:userId" 
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
export default App