from collections import deque
from contextlib import contextmanager
from copy import deepcopy
from dataclasses import dataclass, field
from secrets import token_urlsafe
from threading import Lock
from time import monotonic

import bcrypt
from flask import g, session


DEMO_PATIENT_ID = "demo"
DEMO_RESPONDER_ID = "socorrista-demo"
DEMO_PIN = "2468"
MAX_RECORDS = 40
_MAX_WORKSPACES = 128
_IDLE_SECONDS = 2 * 60 * 60

_PIN_HASH = bcrypt.hashpw(DEMO_PIN.encode(), bcrypt.gensalt()).decode()
_SAMPLE_PROFILES = {
    DEMO_PATIENT_ID: {
        "infoPublica": {"nome": "Marina Alves"},
        "infoPrivada": {
            "tipoSanguineo": "O+",
            "alergias": ["Amendoim", "Penicilina"],
            "medicamentosUsoContinuo": [],
            "historico": "Asma registrada no perfil de exemplo.",
            "contatoEmergencia": "(00) 90000-0000",
        },
    },
    "demo-rafael": {
        "infoPublica": {"nome": "Rafael Lima"},
        "infoPrivada": {"tipoSanguineo": "A+", "alergias": [], "medicamentosUsoContinuo": []},
    },
    "demo-sofia": {
        "infoPublica": {"nome": "Sofia Duarte"},
        "infoPrivada": {"tipoSanguineo": "B-", "alergias": [], "medicamentosUsoContinuo": []},
    },
}
for profile in _SAMPLE_PROFILES.values():
    profile["seguranca"] = {"pinHash": _PIN_HASH, "tentativasFalhas": 0, "bloqueioAte": None}
    profile["pinDeExemplo"] = True

_SAMPLE_RESPONDERS = {
    DEMO_RESPONDER_ID: {
        "nome": "Camila Torres", "email": "camila@example.test", "documento": "DEMO-001",
    },
}


@dataclass
class Workspace:
    patients: dict = field(default_factory=lambda: deepcopy(_SAMPLE_PROFILES))
    responders: dict = field(default_factory=lambda: deepcopy(_SAMPLE_RESPONDERS))
    audit: deque = field(default_factory=lambda: deque(maxlen=100))
    lock: Lock = field(default_factory=Lock)
    last_used: float = field(default_factory=monotonic)


_workspaces = {}
_registry_lock = Lock()


@contextmanager
def demo_workspace():
    if "demo_workspace" not in g:
        now = monotonic()
        with _registry_lock:
            for key, value in list(_workspaces.items()):
                if now - value.last_used >= _IDLE_SECONDS:
                    del _workspaces[key]
            workspace = _workspaces.get(session.get("workspace"))
            if workspace is None:
                if len(_workspaces) >= _MAX_WORKSPACES:
                    del _workspaces[min(_workspaces, key=lambda key: _workspaces[key].last_used)]
                workspace = Workspace()
                key = token_urlsafe(24)
                _workspaces[key] = workspace
                session.clear()
                session["workspace"] = key
            workspace.last_used = now
            g.demo_workspace = workspace

    with g.demo_workspace.lock:
        yield g.demo_workspace
