import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage, getConfig, statusOf } from './api';
import { adminRequest, signOutAdmin } from './firebaseConfig';
import { Brand, Icon, Loading, Notice, PublicHeader } from './Interface';

export default function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const [access, setAccess] = useState(null);
  const [retry, setRetry] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getConfig(), adminRequest('/admin/session', { signal: controller.signal })])
      .then(([config]) => {
        if (!controller.signal.aborted) setAccess({ mode: config.mode });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setAccess({ status: statusOf(error), error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [retry]);

  if (access?.status === 401 || access?.status === 403) {
    return (
      <Navigate to="/login" replace state={{
        from: location.pathname + location.search,
        reason: access.status === 403 ? access.error : '',
      }} />
    );
  }

  if (!access?.mode) {
    return (
      <div className="public-page">
        <PublicHeader />
        <main className="state-page page-width">
          {access?.error ? (
            <>
              <Notice type="error">{access.error}</Notice>
              <button className="button button-outline" onClick={() => { setAccess(null); setRetry(retry + 1); }}>
                Tentar novamente
              </button>
            </>
          ) : <Loading>Verificando a sessão…</Loading>}
        </main>
      </div>
    );
  }

  const responders = location.pathname.startsWith('/admin/responder')
    || new URLSearchParams(location.search).get('tab') === 'socorristas';

  async function logout() {
    setSigningOut(true);
    setLogoutError('');
    try {
      await signOutAdmin();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(errorMessage(error, 'Não foi possível sair. Tente novamente.'));
      setSigningOut(false);
    }
  }

  return (
    <div className="workspace">
      <header className="workspace-header">
        <Brand />
        <div className="workspace-account">
          <span className="workspace-account-label">{access.mode === 'demo' ? 'Sessão de demonstração' : 'Administrador'}</span>
          <button className="button button-outline button-small" onClick={logout} disabled={signingOut}>
            {signingOut ? 'Saindo…' : 'Sair'} <Icon name="arrow" />
          </button>
        </div>
      </header>
      <div className="workspace-frame">
        <aside className="workspace-sidebar">
          <nav aria-label="Painel administrativo">
            <Link to="/admin/dashboard" aria-current={!responders ? 'page' : undefined}>
              <Icon name="person" /> Pacientes
            </Link>
            <Link to="/admin/dashboard?tab=socorristas" aria-current={responders ? 'page' : undefined}>
              <Icon name="plus" /> Socorristas
            </Link>
          </nav>
        </aside>
        <main className="workspace-main">
          {logoutError && <Notice type="error">{logoutError}</Notice>}
          <Outlet context={{ mode: access.mode }} />
        </main>
      </div>
    </div>
  );
}
