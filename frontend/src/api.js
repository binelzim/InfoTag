import axios from 'axios';

const client = axios.create({ baseURL: '/api', timeout: 45000 });
let configRequest;

export async function request(path, options = {}) {
  const response = await client.request({ url: path, ...options });
  return response.data;
}

export function getConfig() {
  configRequest ??= request('/config').catch((error) => {
    configRequest = undefined;
    throw error;
  });
  return configRequest;
}

export function statusOf(error) {
  return error.response?.status ?? error.status;
}

export function errorMessage(error, fallback = 'Não foi possível concluir. Tente novamente.') {
  const message = error.response?.data?.error;
  if (typeof message === 'string') return message;
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha inválidos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de acesso. Aguarde e tente novamente.';
    case 'auth/network-request-failed':
    case 'ERR_NETWORK':
    case 'ECONNABORTED':
      return 'A conexão demorou ou foi interrompida. Tente novamente.';
    default:
      return fallback;
  }
}
