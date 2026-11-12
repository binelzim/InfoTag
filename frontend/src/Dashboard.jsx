import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { errorMessage, statusOf } from './api';
import { adminRequest } from './firebaseConfig';
import { Icon, Loading, Notice, PersonMark } from './Interface';

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export default function Dashboard() {
  const { mode } = useOutletContext();
  const location = useLocation();
  const responders = new URLSearchParams(location.search).get('tab') === 'socorristas';
  const kind = responders ? 'responder' : 'user';
  const group = responders ? 'responders' : 'patients';
  const [records, setRecords] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState({ group: '', value: '' });
  const [copy, setCopy] = useState(null);
  const [selection, setSelection] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const dialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([adminRequest('/admin/users', options), adminRequest('/admin/responders', options)])
      .then(([patients, responderList]) => {
        if (!controller.signal.aborted) setRecords({ patients, responders: responderList });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError({ message: errorMessage(error), status: statusOf(error) });
      });
    return () => controller.abort();
  }, [refresh]);

  const searchValue = search.group === group ? search.value : '';
  const term = normalize(searchValue.trim());
  const nameOf = (item) => (responders ? item.nome : item.infoPublica?.nome) || 'Nome não informado';
  const visible = (records?.[group] || [])
    .filter((item) => normalize([nameOf(item), item.email, item.documento, item.id].filter(Boolean).join(' ')).includes(term))
    .sort((first, second) => collator.compare(nameOf(first), nameOf(second)));

  async function copyLink(id) {
    const link = new URL('/portal/' + id, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(link);
      setCopy({ message: 'Link copiado. Grave este endereço na tag NFC.' });
    } catch {
      setCopy({ message: 'Selecione e copie o endereço da tag.', link });
    }
  }

  function askDelete(item) {
    setSelection({ id: item.id, name: nameOf(item), kind, group });
    setDeleteError('');
    dialog.current.showModal();
  }

  async function confirmDelete() {
    if (!selection) return;
    setDeleting(true);
    try {
      await adminRequest('/admin/' + selection.kind + '/' + selection.id, { method: 'DELETE' });
      setRecords((previous) => ({
        ...previous,
        [selection.group]: previous[selection.group].filter((item) => item.id !== selection.id),
      }));
      dialog.current.close();
    } catch (error) {
      setDeleteError(errorMessage(error, 'Não foi possível excluir o cadastro.'));
    } finally {
      setDeleting(false);
    }
  }

  const message = location.state?.message;
  const newId = location.state?.newPatientId;
  const label = responders ? 'Socorristas' : 'Pacientes';

  return (
    <>
      <div className="workspace-heading">
        <div><h1>Painel de gestão</h1><p>Organize pacientes, links de tags NFC e contas de socorristas.</p></div>
        <Link className="button button-primary" to={'/admin/' + kind + '/new'}>
          <Icon name="plus" /> {responders ? 'Cadastrar socorrista' : 'Cadastrar paciente'}
        </Link>
      </div>

      {message && (
        <Notice type="success">
          {message}{' '}
          {newId && <Link className="text-link" to={'/portal/' + newId}>Abrir portal criado</Link>}
        </Notice>
      )}

      <div className="metrics">
        <Link to="/admin/dashboard" className="metric surface">
          <span className="section-icon"><Icon name="person" /></span>
          <div><span>Pacientes cadastrados</span><strong>{records?.patients.length ?? '–'}</strong></div>
        </Link>
        <Link to="/admin/dashboard?tab=socorristas" className="metric surface">
          <span className="section-icon"><Icon name="plus" /></span>
          <div><span>Socorristas cadastrados</span><strong>{records?.responders.length ?? '–'}</strong></div>
        </Link>
      </div>

      <section className="records surface" aria-labelledby="records-heading">
        <div className="records-header">
          <h2 id="records-heading">{label}</h2>
          <label className="search-field">
            <Icon name="search" /><span className="visually-hidden">Buscar {label.toLowerCase()}</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearch({ group, value: event.target.value })}
              placeholder={responders ? 'Buscar por nome ou e-mail' : 'Buscar por nome ou ID'}
            />
          </label>
        </div>
        {copy && (
          <Notice type="success">
            {copy.message}
            {copy.link && <input className="copy-link-input" aria-label="Link da tag" value={copy.link} readOnly onFocus={(event) => event.target.select()} />}
          </Notice>
        )}
        {loadError ? (
          <div className="records-state">
            <Notice type="error">{loadError.message}</Notice>
            {loadError.status === 401 || loadError.status === 403 ? (
              <Link className="button button-outline" to="/login">Voltar ao login</Link>
            ) : (
              <button className="button button-outline" onClick={() => { setLoadError(null); setRefresh(refresh + 1); }}>
                Tentar novamente
              </button>
            )}
          </div>
        ) : !records ? <div className="records-state"><Loading>Carregando cadastros…</Loading></div> : visible.length === 0 ? (
          <p className="empty-state">{term ? 'Nenhum cadastro corresponde à busca.' : 'Ainda não há cadastros nesta lista.'}</p>
        ) : (
          <div className="table-wrapper">
            <table className="records-table">
              <thead><tr><th scope="col">Nome</th><th scope="col">{responders ? 'Conta' : 'Identificador NFC'}</th><th scope="col">Ações</th></tr></thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td><span className="table-person"><PersonMark name={nameOf(item)} /><strong>{nameOf(item)}</strong></span></td>
                    <td>
                      {responders
                        ? <span className="account-cell">{item.email}{item.documento && <small>{item.documento}</small>}</span>
                        : <code className="identifier">{item.id}</code>}
                    </td>
                    <td>
                      <div className="record-actions">
                        {!responders && (
                          <>
                            <Link to={'/portal/' + item.id} aria-label={'Abrir portal de ' + nameOf(item)}>Abrir</Link>
                            <button type="button" onClick={() => copyLink(item.id)} aria-label={'Copiar link de ' + nameOf(item)}>Copiar link</button>
                          </>
                        )}
                        <Link to={'/admin/' + kind + '/edit/' + item.id} aria-label={'Editar ' + nameOf(item)}>Editar</Link>
                        <button type="button" className="danger-link" onClick={() => askDelete(item)} aria-label={'Excluir ' + nameOf(item)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {mode === 'demo' && !responders && <p className="workspace-note">Os links de novos pacientes ficam disponíveis nesta sessão de demonstração.</p>}

      <dialog className="confirm-dialog" ref={dialog} aria-labelledby="delete-heading" onClose={() => setSelection(null)}
        onCancel={(event) => { if (deleting) event.preventDefault(); }}>
        <h2 id="delete-heading">Excluir cadastro?</h2>
        <p>O cadastro de <strong>{selection?.name}</strong> será excluído.</p>
        {deleteError && <Notice type="error">{deleteError}</Notice>}
        <div className="confirm-actions">
          <button className="button button-outline" onClick={() => dialog.current.close()} disabled={deleting}>Cancelar</button>
          <button className="button button-danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Excluindo…' : 'Excluir cadastro'}</button>
        </div>
      </dialog>
    </>
  );
}
