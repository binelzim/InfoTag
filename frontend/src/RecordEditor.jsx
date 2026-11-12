import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { errorMessage } from './api';
import { adminRequest } from './firebaseConfig';
import { Icon, Loading, Notice } from './Interface';

const resources = {
  user: { singular: 'paciente', back: '/admin/dashboard', summary: 'Defina o que a pessoa encontra ao abrir o link da tag.' },
  responder: { singular: 'socorrista', back: '/admin/dashboard?tab=socorristas', summary: 'Configure uma conta com acesso aos perfis de emergência.' },
};

export default function RecordEditor({ resource, id, payload, children }) {
  const navigate = useNavigate();
  const { mode } = useOutletContext();
  const { singular, back, summary } = resources[resource];
  const path = '/admin/' + resource + '/' + id;
  const [record, setRecord] = useState(id ? null : {});
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    adminRequest(path, { signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) setRecord(value); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(errorMessage(error)); });
    return () => controller.abort();
  }, [id, path]);

  async function save(event) {
    event.preventDefault();
    const data = payload(new FormData(event.currentTarget));
    setSaveError('');
    setPending(true);
    try {
      const result = await adminRequest(id ? path : '/admin/create-' + resource, {
        method: id ? 'PUT' : 'POST', data,
      });
      navigate(back, {
        replace: true,
        state: {
          message: id ? 'Cadastro atualizado.' : 'Cadastro criado.',
          newPatientId: result.newUserId,
        },
      });
    } catch (error) {
      setSaveError(errorMessage(error));
      setPending(false);
    }
  }

  return (
    <div className="editor">
      <Link to={back} className="text-link back-link"><Icon name="arrow" /> Voltar aos cadastros</Link>
      <div className="workspace-heading">
        <div><h1>{id ? 'Editar ' : 'Cadastrar '}{singular}</h1><p>{summary}</p></div>
      </div>
      {mode === 'demo' && <Notice>Preencha com dados fictícios. Este cadastro é temporário.</Notice>}
      {loadError ? <Notice type="error">{loadError}</Notice> : !record ? <Loading>Carregando cadastro…</Loading> : (
        <form className="surface editor-form" onSubmit={save}>
          {children(record, mode)}
          {saveError && <Notice type="error">{saveError}</Notice>}
          <div className="editor-actions">
            <Link to={back} className="button button-outline">Cancelar</Link>
            <button className="button button-primary" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar cadastro'} <Icon name="arrow" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
