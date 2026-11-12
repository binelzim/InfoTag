import { getConfig, request } from './api';

const authSessions = new Map();

function firebaseAuth(config, role) {
  if (!authSessions.has(role)) {
    const session = Promise.all([import('firebase/app'), import('firebase/auth')])
      .then(([app, sdk]) => {
        const options = { apiKey: config.apiKey, projectId: config.projectId, authDomain: config.authDomain };
        const persistence = role === 'admin' ? sdk.browserSessionPersistence : sdk.inMemoryPersistence;
        const auth = sdk.initializeAuth(app.initializeApp(options, role), { persistence });
        return { auth, sdk };
      });
    authSessions.set(role, session);
  }
  return authSessions.get(role);
}

async function bearer(user) {
  if (!user) throw Object.assign(new Error('Sessão necessária'), { status: 401 });
  return { Authorization: 'Bearer ' + await user.getIdToken() };
}

export async function adminRequest(path, options = {}) {
  const config = await getConfig();
  if (config.mode === 'demo') return request(path, options);

  const { auth } = await firebaseAuth(config, 'admin');
  await auth.authStateReady();
  return request(path, { ...options, headers: await bearer(auth.currentUser) });
}

export async function signInAdmin(email, password) {
  const config = await getConfig();
  if (config.mode === 'demo') {
    return request('/demo/session', { method: 'POST', data: {} });
  }

  const { auth, sdk } = await firebaseAuth(config, 'admin');
  const credential = await sdk.signInWithEmailAndPassword(auth, email, password);
  try {
    return await request('/admin/session', { headers: await bearer(credential.user) });
  } catch (error) {
    await sdk.signOut(auth);
    throw error;
  }
}

export async function signOutAdmin() {
  const config = await getConfig();
  if (config.mode === 'demo') return request('/demo/session', { method: 'DELETE' });

  const { auth, sdk } = await firebaseAuth(config, 'admin');
  await sdk.signOut(auth);
}

export async function unlockAsResponder(targetUserId, { email, password, sample = false }) {
  const config = await getConfig();
  const data = { targetUserId };
  if (config.mode === 'demo') {
    return request('/unlock-responder', { method: 'POST', data: { ...data, email, password, sample } });
  }

  const { auth, sdk } = await firebaseAuth(config, 'responder');
  const credential = await sdk.signInWithEmailAndPassword(auth, email, password);
  try {
    return await request('/unlock-responder', {
      method: 'POST', data, headers: await bearer(credential.user),
    });
  } finally {
    await sdk.signOut(auth);
  }
}
