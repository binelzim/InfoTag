import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage, getConfig } from './api';
import { signInAdmin } from './firebaseConfig';
import { Credentials, Icon, Loading, Notice, PublicHeader } from './Interface';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [error, setError] = useState(location.state?.reason || '');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getConfig().then((value) => {
      if (active) setConfig(value);
    }).catch((problem) => {
      if (active) setConfigError(errorMessage(problem));
    });
    return () => { active = false; };
  }, [attempt]);

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setPending(true);
    try {
      await signInAdmin(form.get('email')?.trim(), form.get('password'));
      navigate(location.state?.from ?? '/admin/dashboard', { replace: true });
    } catch (problem) {
      setError(errorMessage(problem));
      setPending(false);
    }
  }

  return (
    <div className="public-page">
      <PublicHeader><Link className="text-link" to="/">Voltar ao início</Link></PublicHeader>
      <main className="login-page page-width">
        <section className="login-card surface">
          <span className="section-icon"><Icon name="lock" /></span>
          <h1>Acesso administrativo</h1>
          <p className="section-summary">Gerencie os perfis vinculados às tags e as contas de socorristas.</p>
          {configError && (
            <>
              <Notice type="error">{configError}</Notice>
              <button className="button button-outline" onClick={() => { setConfigError(''); setAttempt(attempt + 1); }}>
                Tentar novamente
              </button>
            </>
          )}
          {!config && !configError && <Loading>Preparando o acesso…</Loading>}
          {config?.mode === 'demo' && (
            <form className="form-stack" onSubmit={handleLogin}>
              <Notice>Use apenas dados fictícios. Os cadastros de teste ficam nesta sessão temporária.</Notice>
              {error && <Notice type="error">{error}</Notice>}
              <button className="button button-primary" disabled={pending}>
                {pending ? 'Abrindo painel…' : 'Entrar na demonstração'} <Icon name="arrow" />
              </button>
            </form>
          )}
          {config?.mode === 'firebase' && (
            <Credentials onSubmit={handleLogin} pending={pending} error={error} submitLabel="Entrar no painel" />
          )}
        </section>
      </main>
    </div>
  );
}
