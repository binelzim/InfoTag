import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConfig } from './api';
import { Icon, PublicFooter, PublicHeader } from './Interface';

const steps = [
  ['nfc', 'Aproxime o celular', 'Uma tag NFC com o link gravado abre o perfil do paciente no navegador.'],
  ['lock', 'Confirme o acesso', 'O PIN da tag ou uma conta de socorrista autorizada libera os dados médicos.'],
  ['plus', 'Consulte o perfil', 'Confira tipo sanguíneo, alergias, medicamentos, histórico e contato de emergência.'],
];

function TagPreview() {
  return (
    <div className="hero-preview" aria-hidden="true">
      <div className="preview-orbit orbit-outer" />
      <div className="preview-orbit orbit-inner" />
      <div className="mock-tag">
        <span className="tag-hole" />
        <span className="mock-brand"><Icon name="plus" /> Info Tag</span>
        <div className="tag-base"><span>PERFIL DE EMERGÊNCIA</span><Icon name="nfc" /></div>
      </div>
      <div className="mock-profile">
        <div className="mock-profile-label"><Icon name="lock" /> Portal de emergência</div>
        <div className="mock-identity"><span>MA</span><strong>Marina Alves</strong></div>
        <div className="mock-rule" />
        <div className="mock-prompt">PIN do perfil</div>
        <div className="mock-pin"><span>•</span><span>•</span><span>•</span><span>•</span></div>
        <div className="mock-action">Desbloquear perfil <Icon name="arrow" /></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [demoPatient, setDemoPatient] = useState('');
  useEffect(() => {
    let active = true;
    getConfig().then((config) => {
      if (active && config.mode === 'demo') setDemoPatient(config.demoPatientId);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="public-page">
      <PublicHeader>
        <nav className="header-actions" aria-label="Navegação principal">
          <a className="header-how" href="#como-funciona">Como funciona</a>
          <Link className="button button-outline button-small" to="/login">Acesso administrativo <Icon name="arrow" /></Link>
        </nav>
      </PublicHeader>
      <main>
        <section className="page-width hero">
          <div className="hero-copy">
            <p className="eyebrow"><Icon name="nfc" /> Identificação por NFC</p>
            <h1>Dados de saúde <em>em emergências.</em></h1>
            <p className="hero-summary">Uma tag abre o perfil do paciente pelo celular. Com o PIN ou uma conta de socorrista, é possível consultar alergias, medicamentos e o contato de emergência.</p>
            <div className="hero-actions">
              {demoPatient ? (
                <>
                  <Link className="button button-primary" to={'/portal/' + demoPatient}>Testar portal de emergência <Icon name="arrow" /></Link>
                  <Link className="button button-outline" to="/login">Explorar painel</Link>
                </>
              ) : (
                <Link className="button button-primary" to="/login">Acessar painel <Icon name="arrow" /></Link>
              )}
            </div>
            {demoPatient && <p className="demo-note"><span aria-hidden="true" /> Demonstração com dados fictícios</p>}
          </div>
          <TagPreview />
        </section>
        <section className="steps-band" id="como-funciona">
          <div className="page-width steps-inner">
            <h2>Como funciona</h2>
            <div className="step-grid">
              {steps.map(([icon, title, description]) => (
                <article className="step" key={title}>
                  <span className="step-icon"><Icon name={icon} /></span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
