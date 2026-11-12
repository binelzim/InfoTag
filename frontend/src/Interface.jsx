import { Link } from 'react-router-dom';

export function Icon({ name }) {
  return <span aria-hidden="true" className={'icon icon-' + name} />;
}

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Info Tag, início">
      <span className="brand-mark" aria-hidden="true"><Icon name="plus" /></span>
      <span>Info<span className="brand-accent"> Tag</span></span>
    </Link>
  );
}

export function PublicHeader({ children }) {
  return (
    <header className="public-header">
      <div className="page-width header-inner">
        <Brand />
        {children}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="page-width footer-inner">
        <Brand />
        <span>Projeto acadêmico de identificação por NFC</span>
      </div>
    </footer>
  );
}

export function Notice({ children, type = 'info' }) {
  return <div className={'notice notice-' + type} role={type === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function Loading({ children }) {
  return <p className="loading" role="status"><span aria-hidden="true" className="spinner" />{children}</p>;
}

export function PersonMark({ name = '' }) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <span className="person-mark" aria-hidden="true">{initials || 'IT'}</span>;
}

export function Credentials({ onSubmit, pending, submitLabel, error }) {
  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <label className="field">
        <span>E-mail</span>
        <input name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label className="field">
        <span>Senha</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <Notice type="error">{error}</Notice>}
      <button className="button button-primary" disabled={pending}>
        {pending ? 'Verificando acesso…' : submitLabel}
        <Icon name="arrow" />
      </button>
    </form>
  );
}
