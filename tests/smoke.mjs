import assert from "node:assert/strict";

const baseUrl = process.env.SESSIONS_BASE_URL ?? "http://127.0.0.1:3000";
const runId = Date.now();

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function cookieFrom(response) {
  const value = response.headers.get("set-cookie");
  assert.ok(value, "expected session cookie");
  return value.split(";")[0];
}

async function api(path, { cookie, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function register(email) {
  const { response, data } = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Surfer",
      email,
      password: "sessions123",
    }),
  });
  assert.equal(response.status, 200, data.error);
  return { cookie: cookieFrom(response), user: data.user };
}

async function login(email, password = "sessions123") {
  const { response, data } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, data.error);
  return { cookie: cookieFrom(response), user: data.user };
}

const primary = await register(`smoke-${runId}@sessions.dev`);
const secondary = await register(`smoke-guest-${runId}@sessions.dev`);

const sessionPayload = {
  spotId: "praia-do-tombo",
  title: "Smoke session QA",
  date: localDate(),
  waveSize: "0,5m",
  wind: "terral leve",
  board: "5'10",
  mood: "evolução",
  difficulty: "leve",
  wavesCount: 4,
  description: "Session criada pelo smoke test para validar o fluxo principal.",
  isPublic: true,
};

const createdSession = await api("/api/sessions", {
  method: "POST",
  cookie: primary.cookie,
  body: JSON.stringify(sessionPayload),
});
assert.equal(createdSession.response.status, 201, createdSession.data.error);
assert.ok(createdSession.data.session.id);

const forbiddenDelete = await api(`/api/sessions/${createdSession.data.session.id}`, {
  method: "DELETE",
  cookie: secondary.cookie,
});
assert.equal(forbiddenDelete.response.status, 404);

const ownerDelete = await api(`/api/sessions/${createdSession.data.session.id}`, {
  method: "DELETE",
  cookie: primary.cookie,
});
assert.equal(ownerDelete.response.status, 200, ownerDelete.data.error);

const createdCrew = await api("/api/crew", {
  method: "POST",
  cookie: primary.cookie,
  body: JSON.stringify({
    title: "Smoke Crew",
    spotId: "bostro",
    date: localDate(1),
    time: "06:10",
    desiredLevel: "qualquer nível",
    style: "free surf",
    description: "Crew criada pelo smoke test para validar presença e chat.",
    maxPeople: 4,
    acceptsBeginners: true,
  }),
});
assert.equal(createdCrew.response.status, 201, createdCrew.data.error);
const crewId = createdCrew.data.crewSession.id;

const blockedChat = await api(`/api/crew/${crewId}/messages`, {
  method: "GET",
  cookie: secondary.cookie,
});
assert.equal(blockedChat.response.status, 403);

const joinedCrew = await api(`/api/crew/${crewId}/join`, {
  method: "POST",
  cookie: secondary.cookie,
  body: JSON.stringify({ action: "join" }),
});
assert.equal(joinedCrew.response.status, 200, joinedCrew.data.error);

const message = await api(`/api/crew/${crewId}/messages`, {
  method: "POST",
  cookie: secondary.cookie,
  body: JSON.stringify({ message: "Bora alinhar o ponto de encontro." }),
});
assert.equal(message.response.status, 201, message.data.error);

const organizer = await login("organizer@sessions.dev");
const moderator = await login("moderator@sessions.dev");

const circuit = await api("/api/circuits", {
  method: "POST",
  cookie: organizer.cookie,
  body: JSON.stringify({
    name: `Smoke Circuit ${runId}`,
    startsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    spotId: "praia-do-tombo",
    location: "Praia do Tombo",
    city: "Guarujá",
    state: "SP",
    country: "Brasil",
    description: "Circuito criado pelo smoke test para validar moderação.",
    officialUrl: "https://example.com/smoke-circuit",
    organizerName: "Smoke Organizer",
    organizerProfileUrl: "https://example.com/organizer",
    organizerContact: "organizer@example.com",
    reviewMessage: "Validar fluxo de aprovação.",
    prestige: "local",
  }),
});
assert.equal(circuit.response.status, 201, circuit.data.error);

const blockedModeration = await api(`/api/circuits/${circuit.data.competition.id}/moderate`, {
  method: "PATCH",
  cookie: primary.cookie,
  body: JSON.stringify({ status: "approved" }),
});
assert.equal(blockedModeration.response.status, 403);

const approvedCircuit = await api(`/api/circuits/${circuit.data.competition.id}/moderate`, {
  method: "PATCH",
  cookie: moderator.cookie,
  body: JSON.stringify({ status: "approved" }),
});
assert.equal(approvedCircuit.response.status, 200, approvedCircuit.data.error);
assert.equal(approvedCircuit.data.competition.status, "approved");

console.log("Smoke tests passed");
