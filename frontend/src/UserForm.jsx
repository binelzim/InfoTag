import { useParams } from 'react-router-dom';
import RecordEditor from './RecordEditor';

const splitLines = (value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

function patientPayload(form) {
  return {
    infoPublica: { nome: form.get('nome') },
    infoPrivada: {
      contatoEmergencia: form.get('contato'),
      tipoSanguineo: form.get('tipo'),
      historico: form.get('historico'),
      alergias: splitLines(form.get('alergias')),
      medicamentosUsoContinuo: splitLines(form.get('medicamentos')),
    },
    pin: form.get('pin'),
  };
}

export default function UserForm() {
  const { userId } = useParams();
  return (
    <RecordEditor key={userId ?? 'new'} resource="user" id={userId} payload={patientPayload}>
      {(patient) => {
        const data = patient.infoPrivada ?? {};
        return (
          <>
            <fieldset className="form-section">
              <legend>Identificação e acesso</legend>
              <div className="form-grid">
                <label className="field">
                  <span>Nome do paciente</span>
                  <input name="nome" required maxLength={120} defaultValue={patient.infoPublica?.nome} autoComplete="off" />
                  <small>Visível para quem abrir o link da tag.</small>
                </label>
                <label className="field">
                  <span>PIN do perfil</span>
                  <input name="pin" type="password" inputMode="numeric" autoComplete="new-password"
                    pattern="[0-9]{4,6}" maxLength={6} required={!userId} />
                  <small>{userId ? 'Deixe em branco para manter o PIN atual.' : 'Escolha um PIN de 4 a 6 dígitos.'}</small>
                </label>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Informações médicas</legend>
              <div className="form-grid">
                <label className="field">
                  <span>Tipo sanguíneo</span>
                  <input name="tipo" list="blood-types" maxLength={12} defaultValue={data.tipoSanguineo} />
                  <datalist id="blood-types">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => <option key={type} value={type} />)}
                  </datalist>
                </label>
                <label className="field">
                  <span>Telefone de emergência</span>
                  <input name="contato" type="tel" maxLength={32} defaultValue={data.contatoEmergencia} placeholder="(00) 90000-0000" autoComplete="off" />
                </label>
                <label className="field">
                  <span>Alergias</span>
                  <textarea name="alergias" rows={3} maxLength={3630} defaultValue={data.alergias?.join('\n')} />
                  <small>Digite um item por linha.</small>
                </label>
                <label className="field">
                  <span>Medicamentos de uso contínuo</span>
                  <textarea name="medicamentos" rows={3} maxLength={3630} defaultValue={data.medicamentosUsoContinuo?.join('\n')} />
                  <small>Digite um item por linha.</small>
                </label>
                <label className="field field-wide">
                  <span>Histórico e observações</span>
                  <textarea name="historico" rows={4} maxLength={4000} defaultValue={data.historico} />
                </label>
              </div>
            </fieldset>
          </>
        );
      }}
    </RecordEditor>
  );
}
