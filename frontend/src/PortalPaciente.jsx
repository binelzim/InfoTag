import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage, request, statusOf } from './api';
import { unlockAsResponder } from './firebaseConfig';
import { Credentials, Icon, Loading, Notice, PersonMark, PublicHeader } from './Interface';

function MedicalList({ items, empty }) {
  if (!items.length) return <p className="medical-empty">{empty}</p>;
  return <ul className="medical-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

function MedicalDetails({ access, demo, onLock }) {
  const { data } = access;
  const dial = data.contatoEmergencia.replace(/[^\d+]/g, '');
  return (
    <section className="surface unlocked-panel" aria-labelledby="medical-title">
      <div className="portal-card-heading">
        <div>
          <h2 id="medical-title">Informações de emergência</h2>
          <p role="status">{access.responder ? 'Acesso do socorrista registrado.' : 'Perfil liberado pelo PIN.'}</p>
        </div>
        <button className="button button-outline button-small" onClick={onLock}><Icon name="lock" /> Bloquear perfil</button>
      </div>
      <div className="medical-grid">
        <article className="medical-card blood-card">
          <h3>Tipo sanguíneo</h3>
          {data.tipoSanguineo ? <strong className="blood-type">{data.tipoSanguineo}</strong> : <p className="medical-empty">Não informado.</p>}
        </article>
        <article className="medical-card">
          <h3>Contato de emergência</h3>
          {data.contatoEmergencia ? (
            <>
              <p>{data.contatoEmergencia}</p>
              {demo ? <small>Telefone de demonstração</small> : dial && <a className="text-link" href={'tel:' + dial}>Ligar para o contato <Icon name="arrow" /></a>}
            </>
          ) : <p className="medical-empty">Nenhum telefone cadastrado.</p>}
        </article>
        <article className="medical-card">
          <h3>Alergias</h3>
          <MedicalList items={data.alergias} empty="Nenhuma alergia informada." />
        </article>
        <article className="medical-card">
          <h3>Medicamentos de uso contínuo</h3>
          <MedicalList items={data.medicamentosUsoContinuo} empty="Nenhum medicamento informado." />
        </article>
        <article className="medical-card medical-wide">
          <h3>Histórico e observações</h3>
          <p className={data.historico ? 'medical-history' : 'medical-empty'}>{data.historico || 'Nenhuma observação registrada.'}</p>
        </article>
      </div>
    </section>
  );
}

function PatientPortal({ id }) {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [access, setAccess] = useState(null);
  const [method, setMethod] = useState('pin');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request('/public-info/' + encodeURIComponent(id), { signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) setProfile(value); })
      .catch((problem) => {
        if (!controller.signal.aborted) setLoadError({ status: statusOf(problem), message: errorMessage(problem) });
      });
    return () => controller.abort();
  }, [id, loadAttempt]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setTime(now);
      if (now >= lockedUntil) setLockedUntil(0);
    }, 250);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  async function unlockPin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const pin = new FormData(form).get('pin');
    form.reset();
    setError('');
    setPending(true);
    try {
      const result = await request('/unlock', { method: 'POST', data: { userId: id, pin } });
      setAccess({ data: result.data, responder: false });
    } catch (problem) {
      const seconds = problem.response?.data?.retryAfter;
      if (statusOf(problem) === 429 && Number.isFinite(seconds)) {
        const now = Date.now();
        setTime(now);
        setLockedUntil(now + seconds * 1000);
      } else {
        setError(errorMessage(problem));
      }
    } finally {
      setPending(false);
    }
  }

  async function unlockResponder(event, sample = false) {
    event.preventDefault();
    const form = sample ? null : new FormData(event.currentTarget);
    setError('');
    setPending(true);
    try {
      const result = await unlockAsResponder(id, {
        email: form?.get('email')?.trim(), password: form?.get('password'), sample,
      });
      setAccess({ data: result.data, responder: true });
    } catch (problem) {
      setError(errorMessage(problem));
    } finally {
      setPending(false);
    }
  }

  function changeMethod(value) {
    setError('');
    setMethod(value);
  }

  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - time) / 1000));

  return (
    <div className="public-page portal-page">
      <PublicHeader><Link className="text-link" to="/">Voltar ao início</Link></PublicHeader>
      <main className="portal-content">
        {loadError ? (
          <section className="surface portal-error-card">
            <h1>{loadError.status === 404 ? 'Perfil não encontrado' : 'Falha ao abrir o perfil'}</h1>
            <Notice type="error">{loadError.status === 404 ? 'Confira se o endereço gravado na tag está correto e ativo.' : loadError.message}</Notice>
            {loadError.status !== 404 && (
              <button className="button button-outline" onClick={() => { setLoadError(null); setLoadAttempt(loadAttempt + 1); }}>
                Tentar novamente
              </button>
            )}
          </section>
        ) : !profile ? <Loading>Carregando perfil de emergência…</Loading> : (
          <>
            <div className="portal-identity">
              <PersonMark name={profile.nome} />
              <div><p className="eyebrow">Portal de emergência</p><h1>{profile.nome || 'Perfil de paciente'}</h1></div>
            </div>
            {access ? <MedicalDetails access={access} demo={profile.demo} onLock={() => { setAccess(null); changeMethod('pin'); }} /> : (
              <section className="surface access-panel">
                <div className="portal-card-heading">
                  <span className="section-icon"><Icon name="lock" /></span>
                  <div><h2>Perfil protegido</h2><p>Confirme o acesso para consultar as informações de saúde.</p></div>
                </div>
                <div className="access-switch" role="group" aria-label="Forma de acesso">
                  <button type="button" aria-pressed={method === 'pin'} disabled={pending} onClick={() => changeMethod('pin')}>Usar PIN</button>
                  <button type="button" aria-pressed={method === 'responder'} disabled={pending} onClick={() => changeMethod('responder')}>Sou socorrista</button>
                </div>
                {method === 'pin' ? (
                  <div className="form-stack">
                    {profile.demo && <Notice>Perfil de demonstração.{profile.samplePin && <> PIN de teste <strong>{profile.samplePin}</strong>.</>}</Notice>}
                    <form className="form-stack" onSubmit={unlockPin}>
                      <label className="field">
                        <span>PIN do perfil</span>
                        <input className="pin-input" name="pin" type="password" inputMode="numeric"
                          maxLength={6} autoComplete="off" required disabled={secondsLeft > 0} />
                      </label>
                      {secondsLeft > 0 && (
                        <p className="notice notice-error">
                          Muitas tentativas. Tente novamente em <span>{secondsLeft} s</span>.
                        </p>
                      )}
                      {error && <Notice type="error">{error}</Notice>}
                      <button className="button button-primary" disabled={pending || secondsLeft > 0}>
                        {pending ? 'Validando PIN…' : 'Desbloquear perfil'} <Icon name="arrow" />
                      </button>
                    </form>
                    <details className="pin-help">
                      <summary>Ajuda com o PIN</summary>
                      <p>Solicite a redefinição ao responsável pelo cadastro da tag.</p>
                    </details>
                  </div>
                ) : (
                  <div className="form-stack">
                    <Credentials onSubmit={unlockResponder} pending={pending} submitLabel="Acessar como socorrista" error={error} />
                    {profile.demo && (
                      <button type="button" className="button button-outline" disabled={pending} onClick={(event) => unlockResponder(event, true)}>
                        Usar socorrista de teste
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function PortalPaciente() {
  const { userId } = useParams();
  return <PatientPortal key={userId} id={userId} />;
}
