import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Home from './Home';
import { PublicHeader } from './Interface';
import Login from './Login';
import PortalPaciente from './PortalPaciente';
import ProtectedRoute from './ProtectedRoute';
import ResponderForm from './ResponderForm';
import UserForm from './UserForm';

function NotFound() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="state-page page-width">
        <h1>Página não encontrada</h1>
        <Link to="/" className="button button-primary">Voltar ao início</Link>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portal/:userId" element={<PortalPaciente />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/user/new" element={<UserForm />} />
        <Route path="/admin/user/edit/:userId" element={<UserForm />} />
        <Route path="/admin/responder/new" element={<ResponderForm />} />
        <Route path="/admin/responder/edit/:responderId" element={<ResponderForm />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
