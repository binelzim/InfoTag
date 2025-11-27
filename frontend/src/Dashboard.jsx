import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('users'); 
  const [dataList, setDataList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const endpoint = view === 'users' ? '/admin/users' : '/admin/responders';
      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDataList(res.data);
    } catch (err) {
      setError('Erro ao carregar dados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm('');
  }, [view]);

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair do sistema?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deletar ${name}? Esta ação é irreversível.`)) return;
    try {
        const token = await auth.currentUser.getIdToken();
        const endpoint = view === 'users' ? `/admin/user/${id}` : `/admin/responder/${id}`;
        await axios.delete(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setDataList(dataList.filter(item => item.id !== id));
    } catch (err) {
        alert('Erro ao deletar: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredList = dataList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const name = (item.nome || item.infoPublica?.nome || '').toLowerCase();
    const extra = (item.email || item.id || '').toLowerCase();
    return name.includes(term) || extra.includes(term);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard Admin</h2>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <button onClick={() => setView('users')} style={{flex: 1, padding: '12px', background: view === 'users' ? '#1e3c72' : '#e0e0e0', color: view === 'users' ? 'white' : '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease'}}>Pacientes</button>
          <button onClick={() => setView('responders')} style={{flex: 1, padding: '12px', background: view === 'responders' ? '#d32f2f' : '#e0e0e0', color: view === 'responders' ? 'white' : '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease'}}>Socorristas</button>
      </div>
      
      <div className="dashboard-controls">
          <button className="btn-add-user" onClick={() => navigate(view === 'users' ? '/admin/user/new' : '/admin/responder/new')} style={{background: view === 'responders' ? 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)' : undefined}}>+ Adicionar {view === 'users' ? 'Paciente' : 'Socorrista'}</button>
          <input type="text" className="dashboard-search" placeholder={view === 'users' ? "Pesquisar paciente..." : "Pesquisar socorrista..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? <p className="loading-message">Carregando dados...</p> : (
        <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
            <thead>
                <tr><th>Nome</th><th>{view === 'users' ? 'ID (NFC)' : 'Identificação / E-mail'}</th><th>Ações</th></tr>
            </thead>
            <tbody>
                {filteredList.map((item) => (
                <tr key={item.id}>
                    <td><strong style={{color: '#1e3c72'}}>{view === 'users' ? item.infoPublica?.nome : item.nome}</strong></td>
                    <td>{view === 'users' ? (<span style={{fontFamily: 'monospace', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px'}}>{item.id}</span>) : (<div><div>{item.email}</div><small style={{color:'#666'}}>{item.documento}</small></div>)}</td>
                    <td>
                    <div className="dashboard-actions">
                        <button className="btn-edit" onClick={() => {if (view === 'users') {navigate(`/admin/user/edit/${item.id}`);} else {navigate(`/admin/responder/edit/${item.id}`);}}}>Editar</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id, view === 'users' ? item.infoPublica?.nome : item.nome)}>Deletar</button>
                    </div>
                    </td>
                </tr>
                ))}
                {filteredList.length === 0 && !loading && (<tr><td colSpan="3" style={{textAlign:'center', padding:'30px', color: '#888'}}>Nenhum registro encontrado.</td></tr>)}
            </tbody>
            </table>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Dashboard;