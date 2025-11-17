import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom'; // useNavigate para os botões
import axios from 'axios';

const API_URL = 'https://info-tag-backend.onrender.com/api';

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
    if (loading) return <p>Carregando usuários...</p>;
    if (error) return <p className="erro-pin">{error}</p>;
    if (users.length === 0) return <p>Nenhum usuário encontrado.</p>;

    return (
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Nome</th>
            <th style={{ padding: '8px' }}>ID (para NFC)</th>
            <th style={{ padding: '8px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #555' }}>
              <td style={{ padding: '8px' }}>{user.infoPublica?.nome || 'Sem nome'}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{user.id}</td>
              <td style={{ padding: '8px' }}>
                {/* --- BOTÕES ATUALIZADOS --- */}
                <button 
                  onClick={() => navigate(`/admin/user/edit/${user.id}`)} 
                  style={{ marginRight: '5px' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(user.id, user.infoPublica?.nome)}
                  style={{ backgroundColor: '#aa2222' }}
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard Admin</h2>
        <button onClick={handleLogout} style={{ backgroundColor: 'darkred', color: 'white' }}>
          Sair
        </button>
      </div>
      <p>Gerencie todos os usuários cadastrados.</p>
      <hr />
      
      {/* --- BOTÃO ATUALIZADO --- */}
      <button 
        onClick={() => navigate('/admin/user/new')}
        style={{ backgroundColor: 'green', color: 'white', marginBottom: '20px' }}
      >
        + Adicionar Novo Usuário
      </button>

      {renderContent()}
    </div>
  );
}

export default Dashboard;