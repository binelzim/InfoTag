import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://127.0.0.1:5000/api';

function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar os usuários (sem alteração)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Nenhum usuário logado");
      const token = await currentUser.getIdToken();
      
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Erro ao buscar usuários. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Roda a busca quando o componente carrega
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    // ... (sem alteração)
  };

  // --- NOVA FUNÇÃO DE DELETAR ---
  const handleDelete = async (userId, userName) => {
    // Pede confirmação
    if (!window.confirm(`Tem certeza que deseja deletar o usuário ${userName}? Esta ação é irreversível.`)) {
        return;
    }

    try {
        const token = await auth.currentUser.getIdToken();
        await axios.delete(`${API_URL}/admin/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Atualiza a lista na tela removendo o usuário deletado
        setUsers(users.filter(user => user.id !== userId));

    } catch (err) {
        setError('Erro ao deletar usuário: ' + (err.response?.data?.error || err.message));
    }
  };

  // Funções de renderização
  const renderContent = () => {
    if (loading) return <p className="loading-message">Carregando usuários...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (users.length === 0) return <p className="empty-message">Nenhum usuário encontrado.</p>;

    return (
      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>ID (para NFC)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.infoPublica?.nome || 'Sem nome'}</td>
                <td>{user.id}</td>
                <td>
                  <div className="dashboard-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => navigate(`/admin/user/edit/${user.id}`)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user.id, user.infoPublica?.nome)}
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard Admin</h2>
        <button onClick={handleLogout}>
          Sair
        </button>
      </div>
      <p className="dashboard-description">Gerencie todos os usuários cadastrados.</p>
      <hr className="dashboard-hr" />
      
      <button 
        className="btn-add-user"
        onClick={() => navigate('/admin/user/new')}
      >
        + Adicionar Novo Usuário
      </button>

      {renderContent()}
    </div>
  );
}

export default Dashboard;