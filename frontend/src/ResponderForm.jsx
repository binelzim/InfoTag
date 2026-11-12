import { useParams } from 'react-router-dom';
import RecordEditor from './RecordEditor';

function responderPayload(form) {
  return {
    nome: form.get('nome'),
    email: form.get('email'),
    documento: form.get('documento'),
    password: form.get('password'),
  };
}

export default function ResponderForm() {
  const { responderId } = useParams();
  return (
    <RecordEditor key={responderId ?? 'new'} resource="responder" id={responderId} payload={responderPayload}>
      {(responder, mode) => (
        <fieldset className="form-section">
          <legend>Dados da conta</legend>
          <div className="form-grid">
            <label className="field">
              <span>Nome completo</span>
              <input name="nome" defaultValue={responder.nome} maxLength={120} autoComplete="off" required />
            </label>
            <label className="field">
              <span>E-mail de acesso</span>
              <input name="email" type="email" defaultValue={responder.email} maxLength={254} autoComplete="off" required />
            </label>
            <label className="field">
              <span>Identificação profissional</span>
              <input name="documento" defaultValue={responder.documento} maxLength={80} autoComplete="off" />
            </label>
            <label className="field">
              <span>{responderId ? 'Nova senha' : 'Senha inicial'}</span>
              <input name="password" type="password" minLength={8} maxLength={mode === 'demo' ? 72 : 128}
                autoComplete="new-password" required={!responderId} />
              <small>{responderId ? 'Deixe em branco para manter a senha atual.' : 'Use pelo menos 8 caracteres.'}</small>
            </label>
          </div>
        </fieldset>
      )}
    </RecordEditor>
  );
}
