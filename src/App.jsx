import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react";
import {
  Plus, Trash2, Pencil, X, Check, Calendar, Clock, TrendingUp,
  Wallet, Users, Sparkles, Search, LogOut, ChevronRight, ChevronLeft,
  Play, BarChart3, Percent, Send, Loader2, Lock, Delete, Home,
  ListChecks, Euro, ArrowLeft, Timer, Settings, Building2, Palette,
  Download, Upload, KeyRound, CalendarDays, FileText, Share2, Copy, Star,
  Target, Scale
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

/* ============================================================
   STORAGE
   ============================================================ */
const PREFIX = "dentocount:";
const store = {
  async get(key) {
    try { const v = localStorage.getItem(PREFIX + key); return v == null ? null : JSON.parse(v); }
    catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  },
  async delete(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  },
};

/* ============================================================
   THEMES
   ============================================================ */
const THEMES = {
  midnight: {
    label: "Nuit jade", dark: true,
    bg: "#0A101C", bg2: "#101A2C", card: "rgba(18,28,46,0.66)", cardSolid: "#121C2E",
    line: "rgba(130,165,205,0.11)", line2: "rgba(130,165,205,0.22)",
    text: "#EAF0F9", sub: "#93A6C4", faint: "#5E7290",
    accent: "#48E0A8", accentInk: "#06231A", amber: "#F4B65A", rose: "#F27391", violet: "#9B8CFF", sky: "#5CC8FF",
    glow1: "rgba(72,224,168,0.09)", glow2: "rgba(155,140,255,0.08)",
  },
  indigo: {
    label: "Indigo", dark: true,
    bg: "#0B0E1F", bg2: "#12162E", card: "rgba(24,28,54,0.66)", cardSolid: "#161A33",
    line: "rgba(150,160,220,0.12)", line2: "rgba(150,160,220,0.24)",
    text: "#ECEEFB", sub: "#9EA3CE", faint: "#666C99",
    accent: "#8B93FF", accentInk: "#0B0E1F", amber: "#FFC46B", rose: "#FF7CA3", violet: "#B79CFF", sky: "#66D0FF",
    glow1: "rgba(139,147,255,0.12)", glow2: "rgba(102,208,255,0.07)",
  },
  slate: {
    label: "Ardoise", dark: true,
    bg: "#0E1214", bg2: "#151B1E", card: "rgba(26,33,37,0.7)", cardSolid: "#171E22",
    line: "rgba(150,170,175,0.12)", line2: "rgba(150,170,175,0.24)",
    text: "#E8EEEF", sub: "#93A4A8", faint: "#5D6C70",
    accent: "#5AD1C4", accentInk: "#05231F", amber: "#EEBF6A", rose: "#EE8098", violet: "#9D9CF0", sky: "#63C9E8",
    glow1: "rgba(90,209,196,0.09)", glow2: "rgba(99,201,232,0.06)",
  },
  daylight: {
    label: "Jour", dark: false,
    bg: "#F4F7FB", bg2: "#EAF0F7", card: "rgba(255,255,255,0.8)", cardSolid: "#FFFFFF",
    line: "rgba(30,60,100,0.1)", line2: "rgba(30,60,100,0.2)",
    text: "#15243A", sub: "#51617A", faint: "#8798AE",
    accent: "#12B886", accentInk: "#FFFFFF", amber: "#E8983A", rose: "#E24E70", violet: "#7A6CF0", sky: "#2A9FD8",
    glow1: "rgba(18,184,134,0.1)", glow2: "rgba(122,108,240,0.07)",
  },
  sand: {
    label: "Sable", dark: false,
    bg: "#F7F3EC", bg2: "#F0E9DD", card: "rgba(255,252,247,0.82)", cardSolid: "#FFFDF9",
    line: "rgba(90,70,40,0.12)", line2: "rgba(90,70,40,0.22)",
    text: "#2E2418", sub: "#7A6A52", faint: "#A89B8B",
    accent: "#C77D3A", accentInk: "#FFFFFF", amber: "#D19A2E", rose: "#D2607A", violet: "#8A72C4", sky: "#3E9BB8",
    glow1: "rgba(199,125,58,0.1)", glow2: "rgba(138,114,196,0.06)",
  },
};

const CABINET_COLORS = ["#48E0A8", "#9B8CFF", "#F4B65A", "#5CC8FF", "#F27391", "#7FE0C0", "#FFB067", "#B79CFF", "#63D1E8", "#EE8098", "#8BD450", "#FF8FB0"];

/* ============================================================
   THEME CONTEXT
   ============================================================ */
const ThemeCtx = createContext(THEMES.midnight);
const useT = () => useContext(ThemeCtx);

/* ============================================================
   CONFIRM (dialogue intégré — marche partout, même en artifact)
   ============================================================ */
const ConfirmCtx = createContext(() => Promise.resolve(true));
const useConfirm = () => useContext(ConfirmCtx);

function ConfirmProvider({ children }) {
  const T = useT();
  const [state, setState] = useState(null); // { message, resolve }
  const ask = useCallback((message) => new Promise((resolve) => setState({ message, resolve })), []);
  const close = (val) => { state?.resolve(val); setState(null); };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state && (
        <div onClick={() => close(false)} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20, background: T.dark ? "rgba(6,10,18,0.72)" : "rgba(40,50,65,0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "fade .15s ease" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 360, maxWidth: "100%", borderRadius: 18, border: `1px solid ${T.line2}`, background: T.cardSolid, padding: 22 }} className="pop">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: T.rose + "22", display: "grid", placeItems: "center", flexShrink: 0 }}><Trash2 size={19} color={T.rose} /></div>
              <div style={{ fontSize: 14.5, lineHeight: 1.5, paddingTop: 2 }}>{state.message}</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <GhostBtn onClick={() => close(false)}>Annuler</GhostBtn>
              <button onClick={() => close(true)} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: T.rose, color: "#fff" }}><Trash2 size={15} /> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const todayISO = () => new Date().toISOString().slice(0, 10);
const eur = (n) => (n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const eur0 = (n) => (n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
const monthKey = (iso) => iso.slice(0, 7);
const IDLE_MS = 3 * 60 * 1000;

// Tarifs de base CCAM / NGAP 2026 (base de remboursement Sécu, secteur 1,
// selon ameli.fr et la nomenclature en vigueur). Ce sont des bases de départ
// éditables : chaque cabinet peut facturer différemment (dépassements,
// secteur 2, actes hors nomenclature) — à ajuster dans Pratiques si besoin.
const DEFAULT_PRACTICES = [
  { id: "p1", name: "Consultation / examen", price: 23 },
  { id: "p2", name: "Détartrage (2 arcades)", price: 28.92 },
  { id: "p3", name: "Radio rétro-alvéolaire", price: 7.98 },
  { id: "p4", name: "Radio panoramique", price: 21.28 },
  { id: "p5", name: "Composite 1 face", price: 26.97 },
  { id: "p6", name: "Composite 2 faces", price: 45.38 },
  { id: "p7", name: "Composite 3 faces et +", price: 60.95 },
  { id: "p8", name: "Extraction simple", price: 33.44 },
  { id: "p9", name: "Extraction complexe (chirurgicale)", price: 83.60 },
  { id: "p10", name: "Endodontie (1 canal)", price: 33.74 },
  { id: "p11", name: "Endodontie (molaire, plusieurs canaux)", price: 81.94 },
  { id: "p12", name: "Couronne céramo-métallique", price: 107.50 },
  { id: "p13", name: "Couronne céramique (zircone, RAC0)", price: 120 },
  { id: "p14", name: "Inlay-core", price: 70 },
  { id: "p15", name: "Scellement de sillons (par dent)", price: 25.72 },
  { id: "p16", name: "Empreinte / prothèse", price: 64.50 },
  { id: "p17", name: "Coiffage pulpaire", price: 36 },
  { id: "p18", name: "Mainteneur d'espace interdentaire", price: 30 },
];

// ANNONCES — section "achat/vente" en lecture seule pour les utilisateurs.
// Seul toi (le développeur) ajoutes/modifies des fiches ici dans le code,
// puis redéploies. Aucun formulaire de dépôt d'annonce dans l'app : c'est
// volontairement statique, pas une marketplace. Modèle : les cabinets/
// dentistes te paient pour être listés ici (à toi de fixer ton tarif).
const LISTINGS = [
  // Exemple de fiche (à dupliquer et modifier) :
  // {
  //   id: "annonce1",
  //   type: "recherche_rempla", // "recherche_rempla" | "vente_cabinet" | "vente_patientele"
  //   titre: "Cherche remplaçant(e) 2 jours/semaine",
  //   ville: "Toulouse",
  //   dates: "À partir de septembre 2026",
  //   description: "Cabinet moderne, 3 fauteuils, logiciel Julie, patientèle familiale.",
  //   contact: "06 XX XX XX XX — nom@cabinet.fr",
  // },
];

/* ============================================================
   ROOT
   ============================================================ */
export default function App() {
  const [profiles, setProfiles] = useState(null);
  const [profile, setProfile] = useState(null);
  const [locked, setLocked] = useState(false);
  const [welcomed, setWelcomed] = useState(null); // null=loading, true/false

  useEffect(() => {
    (async () => {
      setProfiles((await store.get("profiles")) || []);
      setWelcomed(!!(await store.get("welcomed")));
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    let timer;
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => setLocked(true), IDLE_MS); };
    const ev = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    ev.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer); ev.forEach((e) => window.removeEventListener(e, reset)); };
  }, [profile]);

  if (profiles === null || welcomed === null) return <ThemeCtx.Provider value={THEMES.midnight}><FullLoader /></ThemeCtx.Provider>;

  const saveProfiles = async (next) => { setProfiles(next); await store.set("profiles", next); };
  const prof = profiles.find((p) => p.id === profile);

  // Écran de bienvenue au tout premier lancement sur cet appareil
  if (!welcomed && !profile) {
    return (
      <ThemeCtx.Provider value={THEMES.midnight}>
        <Shell>
          <WelcomeScreen onDone={async () => { await store.set("welcomed", true); setWelcomed(true); }} />
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  return (
    <>
      {!profile && (
        <ThemeCtx.Provider value={THEMES.midnight}>
          <Shell>
            <ProfileGate
              profiles={profiles}
              onAuth={(id) => setProfile(id)}
              onCreate={async (name, pin) => { const p = { id: uid(), name, pin, created: todayISO() }; await saveProfiles([...profiles, p]); setProfile(p.id); }}
              onDelete={async (id) => saveProfiles(profiles.filter((p) => p.id !== id))}
            />
          </Shell>
        </ThemeCtx.Provider>
      )}
      {profile && prof && (
        <Workspace
          key={profile}
          profileId={profile}
          profileName={prof.name}
          profilePin={prof.pin}
          onChangePin={async (newPin) => { await saveProfiles(profiles.map((p) => p.id === profile ? { ...p, pin: newPin } : p)); }}
          onLogout={() => { setProfile(null); setLocked(false); }}
          locked={locked}
          onUnlock={() => setLocked(false)}
        />
      )}
    </>
  );
}

/* ============================================================
   WELCOME SCREEN (premier lancement)
   ============================================================ */
function WelcomeScreen({ onDone }) {
  const T = useT();
  const points = [
    { icon: CalendarDays, color: T.accent, title: "Tes journées et ton planning", text: "Organise tes remplas dans l'agenda, saisis tes actes en quelques secondes, cabinet par cabinet." },
    { icon: BarChart3, color: T.violet, title: "Tes chiffres et tes analyses", text: "CA, rétrocessions, stats par cabinet et un assistant qui t'aide à y voir clair — prêts pour ta compta." },
    { icon: Download, color: T.sky, title: "Tes données t'appartiennent", text: "Tout reste sur ton appareil ; exporte ta sauvegarde et tes rapports quand tu veux, sur n'importe quel appareil." },
  ];
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "64px 22px" }} className="fadeUp">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
        <Logo size={60} />
        <h1 style={{ margin: "18px 0 6px", fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>Bienvenue sur Dentocount</h1>
        <p style={{ margin: 0, textAlign: "center", color: T.sub, fontSize: 15, lineHeight: 1.55 }}>
          L'app des remplaçants dentaires pour suivre son activité et sécuriser ses revenus.
        </p>
      </div>
      <div style={{ display: "grid", gap: 12, marginBottom: 26 }}>
        {points.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} style={{ ...glass(T), padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: p.color + "22", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={19} color={p.color} /></div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.5 }}>{p.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <PrimaryBtn full onClick={onDone}>Commencer <ChevronRight size={16} /></PrimaryBtn>
      <p style={{ textAlign: "center", color: T.faint, fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>
        Astuce : pour la confidentialité de tes patients, utilise des initiales ou une référence plutôt que leur nom complet.
      </p>
    </div>
  );
}

/* ============================================================
   SHELL
   ============================================================ */
function Shell({ children }) {
  const T = useT();
  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(1100px 520px at 12% -12%, ${T.glow1}, transparent 60%),
                   radial-gradient(900px 460px at 100% 0%, ${T.glow2}, transparent 55%),
                   linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)`,
      color: T.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background .4s ease, color .4s ease",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: ${T.line2}; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        input, textarea, button, select { font-family: inherit; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${T.accent}; outline-offset: 1px; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform:none;} }
        @keyframes fade { from { opacity:0;} to { opacity:1;} }
        @keyframes spin { to { transform: rotate(360deg);} }
        @keyframes pop { 0%{transform:scale(.9);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .fadeUp { animation: fadeUp .32s ease both; }
        .pop { animation: pop .2s ease both; }
        .rowh { transition: background .15s; }
        .rowh:hover { background: ${T.line}; }
        .lift { transition: transform .12s ease, border-color .15s, background .15s; }
        .lift:active { transform: scale(.985); }
        @media (prefers-reduced-motion: reduce){ .fadeUp,.pop{animation:none;} }
      `}</style>
      <ConfirmProvider>{children}</ConfirmProvider>
    </div>
  );
}

function FullLoader() {
  const T = useT();
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: T.bg, color: T.accent }}><Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} /></div>;
}

/* ============================================================
   LOGO
   ============================================================ */
function Logo({ size = 40 }) {
  const T = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Logo">
      <defs><linearGradient id="lgJade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={T.accent} /><stop offset="1" stopColor={T.sky} />
      </linearGradient></defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lgJade)" />
      <path d="M24 12.5c-4.2 0-6.6 2.2-6.6 6.1 0 2.1.7 4.3 1.4 7 .6 2.4 1 5.6 1.7 7.4.4 1 .9 1.7 1.7 1.7.9 0 1.2-.9 1.4-2.2.2-1.4.4-3.1 1.4-3.1s1.2 1.7 1.4 3.1c.2 1.3.5 2.2 1.4 2.2.8 0 1.3-.7 1.7-1.7.7-1.8 1.1-5 1.7-7.4.7-2.7 1.4-4.9 1.4-7 0-3.9-2.4-6.1-6.6-6.1z" fill={T.accentInk} opacity="0.92" />
    </svg>
  );
}

/* ============================================================
   PIN PAD
   ============================================================ */
function PinPad({ value, onChange, onSubmit, error }) {
  const T = useT();
  const press = (d) => { if (value.length < 4) onChange(value + d); };
  const back = () => onChange(value.slice(0, -1));
  useEffect(() => { if (value.length === 4) onSubmit?.(value); }, [value]);
  return (
    <div style={{ maxWidth: 260, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 22 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 15, height: 15, borderRadius: "50%",
            background: i < value.length ? (error ? T.rose : T.accent) : "transparent",
            border: `2px solid ${i < value.length ? (error ? T.rose : T.accent) : T.line2}`, transition: "all .15s" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <PinKey key={n} onClick={() => press(String(n))}>{n}</PinKey>)}
        <div /><PinKey onClick={() => press("0")}>0</PinKey><PinKey onClick={back}><Delete size={20} /></PinKey>
      </div>
    </div>
  );
}
function PinKey({ children, onClick }) {
  const T = useT();
  return <button onClick={onClick} className="lift" style={{ height: 58, borderRadius: 15, fontSize: 22, fontWeight: 600, cursor: "pointer", background: T.card, border: `1px solid ${T.line}`, color: T.text, display: "grid", placeItems: "center", backdropFilter: "blur(10px)" }}>{children}</button>;
}

/* ============================================================
   PROFILE GATE
   ============================================================ */
function ProfileGate({ profiles, onAuth, onCreate, onDelete }) {
  const T = useT();
  const [mode, setMode] = useState(profiles.length ? "list" : "create");
  const [target, setTarget] = useState(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState(""); const [pin2, setPin2] = useState("");
  const [step, setStep] = useState("name"); const [error, setError] = useState("");
  const reset = () => { setPin(""); setPin2(""); setStep("name"); setError(""); setName(""); setTarget(null); };

  if (mode === "login" && target) return (
    <GateFrame subtitle={target.name}>
      <div style={{ textAlign: "center", marginBottom: 20, color: T.sub, fontSize: 14 }}>Entre ton code à 4 chiffres</div>
      <PinPad value={pin} error={!!error} onChange={(v) => { setPin(v); setError(""); }}
        onSubmit={(v) => { if (v === target.pin) onAuth(target.id); else { setError("Code incorrect"); setTimeout(() => setPin(""), 400); } }} />
      {error && <ErrMsg>{error}</ErrMsg>}
      <Center><TextLink onClick={() => { reset(); setMode("list"); }}>← Retour</TextLink></Center>
    </GateFrame>
  );

  if (mode === "delete" && target) return (
    <GateFrame subtitle={target.name} danger>
      <div style={{ textAlign: "center", marginBottom: 20, color: T.sub, fontSize: 14 }}>Entre le code pour <b style={{ color: T.rose }}>supprimer</b> ce profil</div>
      <PinPad value={pin} error={!!error} onChange={(v) => { setPin(v); setError(""); }}
        onSubmit={(v) => { if (v === target.pin) { onDelete(target.id); reset(); setMode(profiles.length > 1 ? "list" : "create"); } else { setError("Code incorrect"); setTimeout(() => setPin(""), 400); } }} />
      {error && <ErrMsg>{error}</ErrMsg>}
      <Center><TextLink onClick={() => { reset(); setMode("list"); }}>← Annuler</TextLink></Center>
    </GateFrame>
  );

  if (mode === "create") return (
    <GateFrame subtitle="Nouveau profil">
      {step === "name" ? (
        <div className="fadeUp">
          <Field label="Ton prénom / nom">
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Ex. Tino" style={inputStyle(T)} onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("pin")} />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {profiles.length > 0 && <GhostBtn onClick={() => { reset(); setMode("list"); }}>Retour</GhostBtn>}
            <PrimaryBtn full disabled={!name.trim()} onClick={() => setStep("pin")}>Continuer</PrimaryBtn>
          </div>
        </div>
      ) : (
        <div className="fadeUp">
          <div style={{ textAlign: "center", marginBottom: 20, color: T.sub, fontSize: 14 }}>{step === "pin" ? "Choisis un code à 4 chiffres" : "Confirme ton code"}</div>
          <PinPad value={step === "pin" ? pin : pin2} error={!!error}
            onChange={(v) => { error && setError(""); step === "pin" ? setPin(v) : setPin2(v); }}
            onSubmit={(v) => { if (step === "pin") setStep("confirm"); else { if (v === pin) onCreate(name.trim(), pin); else { setError("Les codes ne correspondent pas"); setTimeout(() => { setPin2(""); setPin(""); setStep("pin"); }, 500); } } }} />
          {error && <ErrMsg>{error}</ErrMsg>}
          <Center><TextLink onClick={() => { setStep("pin"); setPin(""); setPin2(""); setError(""); }}>Recommencer</TextLink></Center>
        </div>
      )}
    </GateFrame>
  );

  return (
    <GateFrame subtitle="Choisis ton profil" wide>
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {profiles.map((p) => (
          <div key={p.id} style={{ ...glass(T), padding: "13px 14px", display: "flex", alignItems: "center", gap: 12 }} className="rowh">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.violet + "22", display: "grid", placeItems: "center", color: T.violet, fontWeight: 700, flexShrink: 0 }}>{p.name.slice(0, 1).toUpperCase()}</div>
            <button onClick={() => { setTarget(p); setPin(""); setError(""); setMode("login"); }} style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: T.text, cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>{p.name} <Lock size={12} color={T.faint} /></div>
              <div style={{ fontSize: 12, color: T.faint }}>Depuis le {new Date(p.created + "T00:00:00").toLocaleDateString("fr-FR")}</div>
            </button>
            <IconBtn danger title="Supprimer (code requis)" onClick={() => { setTarget(p); setPin(""); setError(""); setMode("delete"); }}><Trash2 size={16} /></IconBtn>
          </div>
        ))}
      </div>
      <PrimaryBtn full onClick={() => { reset(); setMode("create"); }}><Plus size={16} /> Nouveau profil</PrimaryBtn>
    </GateFrame>
  );
}
function ErrMsg({ children }) { const T = useT(); return <div style={{ color: T.rose, textAlign: "center", marginTop: 16, fontSize: 14 }}>{children}</div>; }
function Center({ children }) { return <div style={{ textAlign: "center", marginTop: 22 }}>{children}</div>; }

function GateFrame({ children, subtitle, wide, danger }) {
  const T = useT();
  return (
    <div style={{ maxWidth: wide ? 460 : 400, margin: "0 auto", padding: "72px 20px" }} className="fadeUp">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
        <Logo size={56} />
        <h1 style={{ margin: "16px 0 2px", fontSize: 23, fontWeight: 700, letterSpacing: -0.3 }}>Dentocount</h1>
        <div style={{ fontSize: 13, color: danger ? T.rose : T.faint, letterSpacing: 0.3 }}>{subtitle}</div>
      </div>
      <div style={{ ...glass(T), padding: 24, borderColor: danger ? T.rose + "55" : T.line }}>{children}</div>
    </div>
  );
}

/* ============================================================
   LOCK OVERLAY
   ============================================================ */
function LockOverlay({ name, pin, onUnlock, onLogout }) {
  const T = useT();
  const [v, setV] = useState(""); const [error, setError] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: T.dark ? "rgba(8,13,24,0.86)" : "rgba(230,238,247,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", animation: "fade .2s ease" }}>
      <div style={{ width: 360, maxWidth: "92vw", ...glass(T), padding: 28 }} className="pop">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: T.amber + "22", display: "grid", placeItems: "center", border: `1px solid ${T.line2}` }}><Lock size={22} color={T.amber} /></div>
          <div style={{ fontWeight: 700, fontSize: 17, marginTop: 12 }}>Session verrouillée</div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>Entre le code de {name}</div>
        </div>
        <PinPad value={v} error={!!error} onChange={(x) => { setV(x); setError(""); }} onSubmit={(x) => { if (x === pin) onUnlock(); else { setError("Code incorrect"); setTimeout(() => setV(""), 400); } }} />
        {error && <ErrMsg>{error}</ErrMsg>}
        <Center><TextLink onClick={onLogout}>Changer de profil</TextLink></Center>
      </div>
    </div>
  );
}

/* ============================================================
   WORKSPACE
   ============================================================ */
function Workspace({ profileId, profileName, profilePin, onChangePin, onLogout, locked, onUnlock }) {
  const K = (s) => `p:${profileId}:${s}`;
  const [loaded, setLoaded] = useState(false);
  const [practices, setPractices] = useState([]);
  const [journees, setJournees] = useState([]);   // ex "sessions"
  const [remplas, setRemplas] = useState([]);      // périodes de remplacement (planning)
  const [cabinets, setCabinets] = useState([]);
  const [themeId, setThemeId] = useState("midnight");
  const [goal, setGoal] = useState(null); // objectif de CA brut mensuel (nombre ou null)
  const [recapSeenMonth, setRecapSeenMonth] = useState(null); // dernier mois dont le bilan a été vu
  const [manualRecap, setManualRecap] = useState(false); // récap rouvert manuellement depuis l'accueil
  const [tab, setTab] = useState("home");
  const [openJournee, setOpenJournee] = useState(null);

  useEffect(() => {
    (async () => {
      setPractices((await store.get(K("practices"))) || DEFAULT_PRACTICES);
      // migrate old "sessions" -> "journees"
      let j = await store.get(K("journees"));
      if (!j) { const old = await store.get(K("sessions")); j = old || []; }
      let cabs = await store.get(K("cabinets"));
      if (!cabs) {
        const names = [...new Set((j || []).map((x) => (x.label || "").trim()).filter(Boolean))];
        cabs = names.map((n, i) => ({ id: uid(), name: n, color: CABINET_COLORS[i % CABINET_COLORS.length], cut: 0.30 }));
        j = (j || []).map((x) => { const c = cabs.find((c) => c.name === (x.label || "").trim()); return { ...x, cabinetId: x.cabinetId || (c ? c.id : null) }; });
      }
      let rmp = await store.get(K("remplas"));
      if (!rmp) rmp = [];
      // migration douce : anciennes journées sans "paid" -> considérées réglées
      j = (j || []).map((x) => ({ ...x, paid: typeof x.paid === "boolean" ? x.paid : true, ambiance: (typeof x.ambiance === "number") ? x.ambiance : (x.ambiance ?? null) }));
      setCabinets(cabs);
      setJournees(j || []);
      setRemplas(rmp);
      const th = await store.get(K("theme"));
      if (th && THEMES[th]) setThemeId(th);
      const g = await store.get(K("goal"));
      if (typeof g === "number" && g > 0) setGoal(g);
      const rs = await store.get(K("recapSeenMonth"));
      if (rs) setRecapSeenMonth(rs);
      setLoaded(true);
    })();
  }, [profileId]);

  useEffect(() => { if (loaded) store.set(K("practices"), practices); }, [practices, loaded]);
  useEffect(() => { if (loaded) store.set(K("journees"), journees); }, [journees, loaded]);
  useEffect(() => { if (loaded) store.set(K("remplas"), remplas); }, [remplas, loaded]);
  useEffect(() => { if (loaded) store.set(K("cabinets"), cabinets); }, [cabinets, loaded]);
  useEffect(() => { if (loaded) store.set(K("theme"), themeId); }, [themeId, loaded]);
  useEffect(() => { if (loaded) store.set(K("goal"), goal); }, [goal, loaded]);
  useEffect(() => { if (loaded) store.set(K("recapSeenMonth"), recapSeenMonth); }, [recapSeenMonth, loaded]);

  const T = THEMES[themeId] || THEMES.midnight;

  const priceOf = useCallback((id) => practices.find((p) => p.id === id)?.price ?? 0, [practices]);
  const nameOf = useCallback((id) => practices.find((p) => p.id === id)?.name ?? "Pratique supprimée", [practices]);
  const cabinetOf = useCallback((id) => cabinets.find((c) => c.id === id) || null, [cabinets]);
  const revenue = useCallback((j) => j.patients.reduce((s, pt) => s + pt.acts.reduce((a, act) => a + (act.price ?? priceOf(act.practiceId)), 0), 0), [priceOf]);
  const netOf = useCallback((j) => { const c = cabinetOf(j.cabinetId); const cut = c ? c.cut : 0.30; return revenue(j) * (1 - cut); }, [cabinetOf, revenue]);

  // pratiques les plus fréquemment réalisées (pour l'accès rapide "favoris")
  const favoritePractices = useMemo(() => {
    const counts = {};
    for (const j of journees) for (const pt of j.patients) for (const a of pt.acts) counts[a.practiceId] = (counts[a.practiceId] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id).filter((id) => practices.some((p) => p.id === id));
  }, [journees, practices]);

  if (!loaded) return <ThemeCtx.Provider value={T}><Shell><FullLoader /></Shell></ThemeCtx.Provider>;

  const totalBrut = journees.reduce((s, j) => s + revenue(j), 0);

  const ensureCabinet = (name) => {
    const trimmed = name.trim(); if (!trimmed) return null;
    const existing = cabinets.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const used = cabinets.map((c) => c.color);
    const color = CABINET_COLORS.find((c) => !used.includes(c)) || CABINET_COLORS[cabinets.length % CABINET_COLORS.length];
    const nc = { id: uid(), name: trimmed, color, cut: 0.30 };
    setCabinets((cs) => [...cs, nc]);
    return nc.id;
  };

  // SCHEMA_VERSION : incrémenté à chaque évolution du format.
  // L'import DOIT rester compatible avec toutes les versions antérieures.
  const exportData = () => ({
    app: "dentocount",
    schemaVersion: 5,
    profileName,
    practices, journees, remplas, cabinets, themeId,
    goal,
    exportedAt: new Date().toISOString(),
  });

  const importData = (data) => {
    if (!data || typeof data !== "object") { alert("Fichier invalide."); return false; }
    // Migration défensive : on reconstruit tout champ manquant des anciennes versions.
    const v = data.schemaVersion || 1;

    // practices
    if (Array.isArray(data.practices)) setPractices(data.practices);

    // journees (anciennement "sessions")
    let journeesIn = Array.isArray(data.journees) ? data.journees
      : (Array.isArray(data.sessions) ? data.sessions : []);
    // normaliser chaque journée : garantir patients[], acts[], cabinetId (on conserve label pour reconstruire les cabinets si besoin)
    journeesIn = journeesIn.map((j) => ({
      id: j.id || uid(),
      date: j.date,
      cabinetId: j.cabinetId ?? null,
      label: j.label ?? null,
      hours: j.hours ?? null,
      remplaId: j.remplaId ?? null,
      created: j.created || Date.now(),
      // paid : absent dans les sauvegardes < v5 -> on considère ces journées passées
      // comme déjà réglées (pas de suivi rétroactif). ambiance : absent -> non noté.
      paid: typeof j.paid === "boolean" ? j.paid : true,
      ambiance: (typeof j.ambiance === "number" && j.ambiance >= 1 && j.ambiance <= 5) ? j.ambiance : null,
      patients: Array.isArray(j.patients) ? j.patients.map((p) => ({
        id: p.id || uid(),
        name: p.name || "",
        minutes: p.minutes ?? null,
        order: p.order ?? null,
        acts: Array.isArray(p.acts) ? p.acts : [],
      })) : [],
    }));

    // cabinets : si absents (très vieux format), reconstruire depuis les labels
    let cabinetsIn = Array.isArray(data.cabinets) ? data.cabinets : null;
    if (!cabinetsIn) {
      const names = [...new Set(journeesIn.map((x) => (x.label || "").trim()).filter(Boolean))];
      cabinetsIn = names.map((n, i) => ({ id: uid(), name: n, color: CABINET_COLORS[i % CABINET_COLORS.length], cut: 0.30 }));
      journeesIn = journeesIn.map((x) => { const c = cabinetsIn.find((c) => c.name === (x.label || "").trim()); return { ...x, cabinetId: x.cabinetId || (c ? c.id : null) }; });
    }
    // nettoyer le champ label temporaire
    journeesIn = journeesIn.map(({ label, ...rest }) => rest);
    // garantir cut sur chaque cabinet
    cabinetsIn = cabinetsIn.map((c, i) => ({ id: c.id || uid(), name: c.name || `Cabinet ${i + 1}`, color: c.color || CABINET_COLORS[i % CABINET_COLORS.length], cut: typeof c.cut === "number" ? c.cut : 0.30 }));

    // remplas : peut ne pas exister dans les anciennes versions -> []
    const remplasIn = Array.isArray(data.remplas) ? data.remplas.map((r) => ({
      id: r.id || uid(), cabinetId: r.cabinetId ?? null, start: r.start, end: r.end || r.start,
      note: r.note || "", hours: r.hours ?? null, created: r.created || Date.now(),
    })) : [];

    setCabinets(cabinetsIn);
    setJournees(journeesIn);
    setRemplas(remplasIn);
    if (Array.isArray(data.practices)) setPractices(data.practices);
    if (data.themeId && THEMES[data.themeId]) setThemeId(data.themeId);
    if (typeof data.goal === "number" && data.goal > 0) setGoal(data.goal);
    return true;
  };

  // liste des dates ISO entre start et end inclus
  const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const datesBetween = (start, end) => {
    const out = []; const d = new Date(start + "T00:00:00"); const last = new Date(end + "T00:00:00");
    while (d <= last) { out.push(fmtISO(d)); d.setDate(d.getDate() + 1); }
    return out;
  };

  // garantit qu'une journée existe pour une date + cabinet donné ; renvoie son id
  const ensureJournee = (date, cabinetId) => {
    const existing = journees.find((j) => j.date === date && j.cabinetId === cabinetId);
    if (existing) return existing.id;
    const jn = { id: uid(), date, cabinetId: cabinetId || null, hours: null, patients: [], paid: false, ambiance: null, created: Date.now() };
    setJournees((js) => [jn, ...js]);
    return jn.id;
  };

  // crée un rempla (période) + génère les journées correspondantes
  const createRempla = ({ cabinetId, start, end, note, hours }) => {
    const r = { id: uid(), cabinetId: cabinetId || null, start, end: end || start, note: (note || "").trim(), hours: hours || null, created: Date.now() };
    setRemplas((rs) => [...rs, r]);
    // générer une journée par jour de la période si absente
    const dates = datesBetween(r.start, r.end);
    setJournees((js) => {
      const add = [];
      for (const d of dates) {
        if (!js.some((j) => j.date === d && j.cabinetId === r.cabinetId)) {
          add.push({ id: uid(), date: d, cabinetId: r.cabinetId || null, hours: hours || null, patients: [], paid: false, ambiance: null, created: Date.now(), remplaId: r.id });
        }
      }
      return [...add, ...js];
    });
    return r.id;
  };

  const updateRempla = (id, patch) => setRemplas((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));

  // Supprime un rempla. Par défaut, supprime AUSSI toutes ses journées (vides ou non).
  // On peut demander à conserver les journées déjà remplies (keepFilled=true).
  const deleteRempla = (id, keepFilled) => {
    const r = remplas.find((x) => x.id === id);
    setRemplas((rs) => rs.filter((x) => x.id !== id));
    if (r) {
      const dates = datesBetween(r.start, r.end);
      setJournees((js) => js.filter((j) => {
        const belongs = (j.remplaId === id) || (dates.includes(j.date) && j.cabinetId === r.cabinetId);
        if (!belongs) return true;                 // pas concernée -> on garde
        if (keepFilled && j.patients.length > 0) return true; // on garde les remplies si demandé
        return false;                              // sinon on supprime
      }));
    }
  };

  // Supprime UNE journée, où qu'elle soit. Nettoie le lien vers son rempla,
  // et supprime le rempla s'il ne lui reste plus aucune journée.
  // Suppression atomique d'une ou plusieurs journées (un seul setState chacun).
  // Les remplas qui n'ont plus aucune journée rattachée sont retirés dans la foulée.
  const deleteJournees = (ids) => {
    const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
    const next = journees.filter((j) => !idSet.has(j.id));
    const stillUsed = new Set(next.map((j) => j.remplaId).filter(Boolean));
    const wasReferenced = new Set(journees.map((j) => j.remplaId).filter(Boolean));
    setJournees(next);
    setRemplas((rs) => rs.filter((r) => !wasReferenced.has(r.id) || stillUsed.has(r.id)));
  };
  const deleteJournee = (journeeId) => deleteJournees([journeeId]);

  const updateJournee = (updated) => setJournees((js) => js.map((j) => j.id === updated.id ? updated : j));

  const props = { journees, setJournees, remplas, setRemplas, cabinets, setCabinets, practices, setPractices, priceOf, nameOf, cabinetOf, revenue, netOf, ensureCabinet, ensureJournee, createRempla, updateRempla, deleteRempla, deleteJournee, deleteJournees, updateJournee, datesBetween, favoritePractices, goal, setGoal };

  // RÉCAP MENSUEL AUTOMATIQUE : dès qu'un nouveau mois a commencé et qu'il y a
  // des données sur le mois précédent, on montre le bilan une fois (mémorisé
  // par profil). Toujours réaccessible ensuite via le bouton sur l'accueil.
  const now = new Date();
  const curMonthKey = now.toISOString().slice(0, 7);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const prevHasData = loaded && journees.some((j) => monthKey(j.date) === prevMonthKey && j.patients.length > 0);
  const showRecap = loaded && (manualRecap || (prevHasData && recapSeenMonth !== curMonthKey));
  const closeRecap = () => { setManualRecap(false); if (recapSeenMonth !== curMonthKey) setRecapSeenMonth(curMonthKey); };

  return (
    <ThemeCtx.Provider value={T}>
      <Shell>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px 90px" }}>
          <TopBar profileName={profileName} tab={tab} setTab={(t) => { setTab(t); setOpenJournee(null); }} onLogout={onLogout} totalBrut={totalBrut} />

          {tab === "home" && <HomeView {...props} onOpen={(id) => { setOpenJournee(id); setTab("journees"); }} goTo={setTab} prevMonthKey={prevMonthKey} onOpenRecap={() => setManualRecap(true)} />}

          {tab === "journees" && !openJournee && <JourneesList {...props} onOpen={setOpenJournee} />}
          {tab === "journees" && openJournee && (
            <JourneeDetail journee={journees.find((j) => j.id === openJournee)} {...props}
              onBack={() => setOpenJournee(null)}
              onUpdate={updateJournee}
              onDelete={(id) => { deleteJournee(id); setOpenJournee(null); }}
              onDuplicate={(src) => {
                const copy = { ...src, id: uid(), date: todayISO(), created: Date.now(), remplaId: null,
                  patients: src.patients.map((p) => ({ ...p, id: uid(), acts: p.acts.map((a) => ({ ...a })) })) };
                setJournees((js) => [copy, ...js]); setOpenJournee(copy.id);
              }} />
          )}

          {tab === "agenda" && <AgendaView {...props} onOpen={(id) => { setOpenJournee(id); setTab("journees"); }} />}

          {tab === "practices" && <PracticesManager practices={practices} setPractices={setPractices} />}

          {tab === "stats" && <StatsView {...props} />}

          {tab === "settings" && <SettingsView themeId={themeId} setThemeId={setThemeId} cabinets={cabinets} setCabinets={setCabinets}
            journees={journees} cabinetOf={cabinetOf} priceOf={priceOf} nameOf={nameOf} revenue={revenue} netOf={netOf}
            profilePin={profilePin} onChangePin={onChangePin} exportData={exportData} importData={importData} />}

          {tab === "ads" && <AdsView />}

          {tab === "ai" && <AIView journees={journees} priceOf={priceOf} nameOf={nameOf} cabinetOf={cabinetOf} revenue={revenue} />}
        </div>
        {showRecap && (
          <MonthlyRecap monthKeyStr={prevMonthKey} journees={journees} revenue={revenue} netOf={netOf} cabinetOf={cabinetOf} onClose={closeRecap} />
        )}
        {locked && <LockOverlay name={profileName} pin={profilePin} onUnlock={onUnlock} onLogout={onLogout} />}
      </Shell>
    </ThemeCtx.Provider>
  );
}

/* ============================================================
   TOP BAR (scrollable tabs)
   ============================================================ */
function TopBar({ profileName, tab, setTab, onLogout, totalBrut }) {
  const T = useT();
  const tabs = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "journees", label: "Journées", icon: Calendar },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
    { id: "practices", label: "Pratiques", icon: ListChecks },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "ads", label: "Annonces", icon: Building2 },
    { id: "ai", label: "Assistant", icon: Sparkles },
    { id: "settings", label: "Réglages", icon: Settings },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, paddingTop: 16, marginBottom: 20, background: `linear-gradient(180deg, ${T.bg} 60%, transparent)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <Logo size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: T.faint }}>Espace de</div>
          <div style={{ fontWeight: 700, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profileName}</div>
        </div>
        <div style={{ textAlign: "right", marginRight: 2 }}>
          <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>CA brut total</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.accent }}>{eur(totalBrut)}</div>
        </div>
        <IconBtn title="Verrouiller / changer de profil" onClick={onLogout}><LogOut size={16} /></IconBtn>
      </div>
      <nav style={{ display: "flex", gap: 5, ...glass(T), padding: 5, borderRadius: 14, overflowX: "auto" }}>
        {tabs.map((t) => {
          const active = tab === t.id; const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="lift" style={{
              flex: "1 0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 13px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600,
              border: "none", transition: "all .2s", whiteSpace: "nowrap",
              background: active ? T.accent : "transparent", color: active ? T.accentInk : T.sub,
            }}><Icon size={15} /> {t.label}</button>
          );
        })}
      </nav>
    </header>
  );
}

/* ============================================================
   HOME / DASHBOARD
   ============================================================ */
// RÉCAP MENSUEL — bilan du mois écoulé : CA brut/net, comparaison au mois
// précédent, meilleur cabinet, meilleure journée. C'est le rendez-vous
// récurrent qui donne envie de revenir chaque mois.
// ANNONCES — vitrine statique en lecture seule (voir LISTINGS en haut du fichier).
function AdsView() {
  const T = useT();
  const TYPE_LABEL = { recherche_rempla: "Cherche remplaçant", vente_cabinet: "Vente de cabinet", vente_patientele: "Vente de patientèle" };
  const TYPE_COLOR = { recherche_rempla: T.accent, vente_cabinet: T.violet, vente_patientele: T.amber };
  return (
    <div className="fadeUp">
      <SectionHead title="Annonces" subtitle="Cabinets et opportunités — mis à jour régulièrement." />
      {LISTINGS.length === 0 ? (
        <Empty icon={Building2} title="Aucune annonce pour l'instant" text="Reviens bientôt : les cabinets qui cherchent un remplaçant ou une opportunité à saisir apparaîtront ici." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {LISTINGS.map((ad) => (
            <div key={ad.id} style={{ ...glass(T), padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: (TYPE_COLOR[ad.type] || T.accent) + "22", color: TYPE_COLOR[ad.type] || T.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {TYPE_LABEL[ad.type] || "Annonce"}
                </span>
                {ad.ville && <span style={{ fontSize: 12, color: T.faint, display: "flex", alignItems: "center", gap: 4 }}>📍 {ad.ville}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>{ad.titre}</div>
              {ad.dates && <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 8 }}>🗓️ {ad.dates}</div>}
              {ad.description && <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.55, marginBottom: 10 }}>{ad.description}</div>}
              {ad.contact && (
                <div style={{ fontSize: 13, fontWeight: 600, color: T.accent, padding: "9px 12px", borderRadius: 10, background: T.bg2, border: `1px solid ${T.line}` }}>
                  ✉️ {ad.contact}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MonthlyRecap({ monthKeyStr, journees, revenue, netOf, cabinetOf, onClose }) {
  const T = useT();
  const [y, m] = monthKeyStr.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const priorKey = new Date(y, m - 2, 1).toISOString().slice(0, 7);

  const monthJournees = journees.filter((j) => monthKey(j.date) === monthKeyStr && j.patients.length > 0);
  const brut = monthJournees.reduce((s, j) => s + revenue(j), 0);
  const net = monthJournees.reduce((s, j) => s + netOf(j), 0);
  const patients = monthJournees.reduce((s, j) => s + j.patients.length, 0);
  const priorBrut = journees.filter((j) => monthKey(j.date) === priorKey && j.patients.length > 0).reduce((s, j) => s + revenue(j), 0);
  const delta = priorBrut > 0 ? Math.round(((brut - priorBrut) / priorBrut) * 100) : null;

  const byCab = {};
  for (const j of monthJournees) { const c = cabinetOf(j.cabinetId); const n = c?.name || "Sans cabinet"; byCab[n] = (byCab[n] || 0) + revenue(j); }
  const bestCabEntry = Object.entries(byCab).sort((a, b) => b[1] - a[1])[0];
  const bestDay = [...monthJournees].sort((a, b) => revenue(b) - revenue(a))[0];

  if (!monthJournees.length) return null;

  return (
    <Modal onClose={onClose} title={`Bilan de ${monthLabel}`} accent={T.accent}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Ton bilan est prêt 🎉</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: T.accent, letterSpacing: -0.5 }}>{eur(brut)}</div>
        <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>de CA brut, {eur(net)} net</div>
        {delta != null && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, padding: "5px 11px", borderRadius: 999, background: (delta >= 0 ? T.accent : T.rose) + "1c", color: delta >= 0 ? T.accent : T.rose, fontSize: 12.5, fontWeight: 700 }}>
            <TrendingUp size={13} style={{ transform: delta < 0 ? "scaleY(-1)" : "none" }} /> {delta >= 0 ? "+" : ""}{delta}% vs le mois d'avant
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ ...glass(T), padding: 13, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{monthJournees.length}</div>
          <div style={{ fontSize: 11.5, color: T.faint }}>journées</div>
        </div>
        <div style={{ ...glass(T), padding: 13, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{patients}</div>
          <div style={{ fontSize: 11.5, color: T.faint }}>patients</div>
        </div>
      </div>

      {bestCabEntry && (
        <div style={{ ...glass(T), padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <Building2 size={16} color={T.violet} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 0.5 }}>Meilleur cabinet</div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{bestCabEntry[0]}</div>
          </div>
          <b style={{ color: T.accent }}>{eur(bestCabEntry[1])}</b>
        </div>
      )}

      {bestDay && revenue(bestDay) > 0 && (
        <div style={{ ...glass(T), padding: 14, marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <TrendingUp size={16} color={T.accent} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 0.5 }}>Meilleure journée</div>
            <div style={{ fontWeight: 600, fontSize: 13.5, textTransform: "capitalize" }}>{new Date(bestDay.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}</div>
          </div>
          <b style={{ color: T.accent }}>{eur(revenue(bestDay))}</b>
        </div>
      )}

      <PrimaryBtn full onClick={onClose}>Fermer</PrimaryBtn>
    </Modal>
  );
}

function HomeView({ journees, cabinets, cabinetOf, revenue, netOf, goal, setGoal, onOpen, goTo, prevMonthKey, onOpenRecap }) {
  const T = useT();
  const [editGoal, setEditGoal] = useState(false);
  const [goalBuf, setGoalBuf] = useState(goal || "");
  const now = new Date(); const mk = now.toISOString().slice(0, 7);
  const monthJournees = journees.filter((j) => monthKey(j.date) === mk);
  const monthBrut = monthJournees.reduce((s, j) => s + revenue(j), 0);
  const monthNet = monthJournees.reduce((s, j) => s + netOf(j), 0);
  const monthPatients = monthJournees.reduce((s, j) => s + j.patients.length, 0);
  const monthRated = monthJournees.filter((j) => typeof j.ambiance === "number");
  const monthAmbiance = monthRated.length ? monthRated.reduce((s, j) => s + j.ambiance, 0) / monthRated.length : null;
  const GREETINGS = ["Chaque patient compte.", "Belle activité en cours.", "Continue comme ça !", "Prends soin de toi aussi."];
  const greeting = GREETINGS[now.getDate() % GREETINGS.length];
  const sorted = [...journees].sort((a, b) => (a.date < b.date ? 1 : -1));
  const upcoming = sorted.filter((j) => j.date >= todayISO()).sort((a, b) => a.date < b.date ? -1 : 1)[0];
  // journées de la semaine en cours (lundi -> dimanche), passées et à venir
  const weekJournees = useMemo(() => {
    const day = now.getDay(); // 0=dimanche
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const mondayISO = monday.toISOString().slice(0, 10);
    const sundayISO = sunday.toISOString().slice(0, 10);
    return journees.filter((j) => j.date >= mondayISO && j.date <= sundayISO).sort((a, b) => a.date < b.date ? -1 : 1);
  }, [journees, now]);
  const best = [...journees].sort((a, b) => revenue(b) - revenue(a))[0];
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const prevLabel = prevMonthKey ? new Date(prevMonthKey + "-01T00:00:00").toLocaleDateString("fr-FR", { month: "long" }) : "";
  const hasPrevRecap = prevMonthKey ? journees.some((j) => monthKey(j.date) === prevMonthKey && j.patients.length > 0) : false;

  // objectif : progression + projection fin de mois au rythme actuel
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pct = goal ? Math.min(100, Math.round((monthBrut / goal) * 100)) : 0;
  const projection = dayOfMonth >= 3 ? Math.round((monthBrut / dayOfMonth) * daysInMonth) : null;
  const onTrack = goal && projection != null ? projection >= goal : null;

  // comparateur : €/heure par cabinet (fallback €/journée si pas d'heures) + ambiance moyenne
  const comparison = useMemo(() => {
    const rows = [];
    for (const c of cabinets) {
      const js = journees.filter((j) => j.cabinetId === c.id && j.patients.length > 0);
      if (!js.length) continue;
      const brut = js.reduce((s, j) => s + revenue(j), 0);
      const net = js.reduce((s, j) => s + netOf(j), 0);
      const hs = js.reduce((s, j) => s + (j.hours || 0), 0);
      const rated = js.filter((j) => typeof j.ambiance === "number");
      const ambiance = rated.length ? rated.reduce((s, j) => s + j.ambiance, 0) / rated.length : null;
      rows.push({ cab: c, journees: js.length, brut, net, perHour: hs > 0 ? net / hs : null, perDay: net / js.length, ambiance });
    }
    // trier par le meilleur indicateur disponible
    const allHaveHours = rows.length >= 2 && rows.every((r) => r.perHour != null);
    rows.sort((a, b) => allHaveHours ? b.perHour - a.perHour : b.perDay - a.perDay);
    let verdict = null;
    if (rows.length >= 2) {
      const [a, b] = rows;
      if (allHaveHours) {
        const diff = Math.round(((a.perHour - b.perHour) / b.perHour) * 100);
        if (diff >= 5) verdict = `${a.cab.name} te rapporte ${diff}% de plus par heure travaillée que ${b.cab.name}.`;
      } else {
        const diff = Math.round(((a.perDay - b.perDay) / b.perDay) * 100);
        if (diff >= 5) verdict = `${a.cab.name} te rapporte ${diff}% de plus par journée que ${b.cab.name} (net).`;
      }
    }
    return { rows, verdict, allHaveHours };
  }, [cabinets, journees, revenue, netOf]);

  // reste à percevoir : journées travaillées non marquées "payées", groupées par cabinet
  const unpaid = useMemo(() => {
    const rows = [];
    for (const c of cabinets) {
      const js = journees.filter((j) => j.cabinetId === c.id && j.patients.length > 0 && !j.paid);
      if (!js.length) continue;
      rows.push({ cab: c, count: js.length, total: js.reduce((s, j) => s + revenue(j), 0) });
    }
    rows.sort((a, b) => b.total - a.total);
    return { rows, total: rows.reduce((s, r) => s + r.total, 0) };
  }, [cabinets, journees, revenue]);

  const saveGoal = () => { const v = Number(String(goalBuf).replace(",", ".")); setGoal(v > 0 ? v : null); setEditGoal(false); };

  return (
    <div className="fadeUp">
      <SectionHead title={`Bonjour 👋`} subtitle={greeting} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
        <button onClick={() => goTo("agenda")} className="lift" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 13, cursor: "pointer", background: T.accent, color: T.bg, border: "none", fontWeight: 700, fontSize: 13.5 }}>
          <Plus size={16} /> Nouvelle journée
        </button>
        <button onClick={() => goTo("agenda")} className="lift" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 13, cursor: "pointer", background: T.bg2, color: T.text, border: `1px solid ${T.line}`, fontWeight: 600, fontSize: 13.5 }}>
          <CalendarDays size={16} /> Voir l'agenda
        </button>
      </div>

      {hasPrevRecap && (
        <button onClick={onOpenRecap} className="lift" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: `${T.accent}14`, border: `1px solid ${T.accent}33`, cursor: "pointer", marginBottom: 14, color: T.text, textAlign: "left" }}>
          <Sparkles size={16} color={T.accent} />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Voir le bilan de {prevLabel}</span>
          <ChevronRight size={15} color={T.accent} />
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginBottom: 8 }}>
        <BigStat icon={Users} label="Patients suivis" value={monthPatients} color={T.sky} />
        <BigStat icon={Calendar} label="Journées" value={monthJournees.length} color={T.violet} />
        <BigStat icon={Wallet} label="CA brut du mois" value={eur(monthBrut)} color={T.accent} />
        <BigStat icon={Euro} label="CA net du mois" value={eur(monthNet)} color={T.amber} />
      </div>
      {monthAmbiance != null && (
        <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          ⭐ Ambiance moyenne ce mois : <b style={{ color: T.text }}>{monthAmbiance.toFixed(1)}/5</b>
        </div>
      )}
      {monthAmbiance == null && <div style={{ marginBottom: 16 }} />}

      {/* OBJECTIF DU MOIS */}
      <div style={{ ...glass(T), padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: goal ? 12 : 0 }}>
          <Target size={16} color={T.accent} />
          <b style={{ fontSize: 14 }}>Objectif du mois</b>
          {editGoal ? (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <input value={goalBuf} onChange={(e) => setGoalBuf(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ex. 4000" autoFocus inputMode="decimal"
                onKeyDown={(e) => e.key === "Enter" && saveGoal()} style={{ ...inputStyle(T), width: 110, padding: "8px 10px" }} />
              <IconBtn title="OK" onClick={saveGoal}><Check size={15} color={T.accent} /></IconBtn>
            </div>
          ) : (
            <button onClick={() => { setGoalBuf(goal || ""); setEditGoal(true); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: goal ? T.sub : T.accent, fontSize: 13, display: "flex", alignItems: "center", gap: 5, padding: 0, fontWeight: 600 }}>
              {goal ? <>{eur(goal)} <Pencil size={12} /></> : <>Définir un objectif <Plus size={13} /></>}
            </button>
          )}
        </div>
        {goal > 0 && (
          <>
            <div style={{ height: 12, borderRadius: 8, background: T.bg2, border: `1px solid ${T.line}`, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 8, background: `linear-gradient(90deg, ${T.accent}, ${pct >= 100 ? T.accent : T.violet})`, transition: "width .5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: T.sub, flexWrap: "wrap", gap: 6 }}>
              <span><b style={{ color: T.text }}>{pct}%</b> — {eur(monthBrut)} / {eur(goal)}</span>
              {projection != null && (
                <span style={{ color: onTrack ? T.accent : T.amber, fontWeight: 600 }}>
                  {pct >= 100 ? "Objectif atteint 🎉" : onTrack ? `En bonne voie (~${eur(projection)} projetés)` : `Rythme actuel : ~${eur(projection)} en fin de mois`}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* COMPARATEUR DE CABINETS */}
      {comparison.rows.length >= 2 && (
        <div style={{ ...glass(T), padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Scale size={16} color={T.violet} /><b style={{ fontSize: 14 }}>Comparateur de cabinets</b>
          </div>
          {comparison.verdict && (
            <div style={{ padding: "10px 13px", borderRadius: 10, background: T.violet + "18", border: `1px solid ${T.violet}33`, fontSize: 13.5, marginBottom: 12, lineHeight: 1.5 }}>
              💡 {comparison.verdict}
            </div>
          )}
          <div style={{ display: "grid", gap: 7 }}>
            {comparison.rows.map((r, i) => (
              <div key={r.cab.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: T.bg2, border: `1px solid ${i === 0 ? r.cab.color + "66" : T.line}` }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: r.cab.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.cab.name}</span>
                {r.ambiance != null && <span style={{ fontSize: 11.5, color: T.faint }}>⭐ {r.ambiance.toFixed(1)}</span>}
                <span style={{ fontSize: 12, color: T.faint }}>{r.journees} j.</span>
                <b style={{ color: T.accent, fontSize: 13.5 }}>{r.perHour != null && comparison.allHaveHours ? `${eur(r.perHour)}/h` : `${eur(r.perDay)}/jour`}</b>
              </div>
            ))}
          </div>
          {!comparison.allHaveHours && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>💡 Renseigne les heures de tes journées pour comparer en €/heure (plus précis).</div>}
        </div>
      )}

      {/* RESTE À PERCEVOIR */}
      {unpaid.rows.length > 0 && (
        <div style={{ ...glass(T), padding: 16, marginBottom: 12, border: `1px solid ${T.amber}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Euro size={16} color={T.amber} /><b style={{ fontSize: 14 }}>Reste à percevoir</b>
            <span style={{ marginLeft: "auto", fontWeight: 700, color: T.amber, fontSize: 15 }}>{eur(unpaid.total)}</span>
          </div>
          <div style={{ display: "grid", gap: 7 }}>
            {unpaid.rows.map((r) => (
              <div key={r.cab.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: T.bg2 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: r.cab.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{r.cab.name}</span>
                <span style={{ fontSize: 12, color: T.faint }}>{r.count} journée{r.count > 1 ? "s" : ""}</span>
                <b style={{ color: T.amber, fontSize: 13.5 }}>{eur(r.total)}</b>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>💡 Marque une journée comme "payée" une fois réglée, depuis son détail.</div>
        </div>
      )}

      {journees.length === 0 ? (
        <Empty icon={Calendar} title="Bienvenue !" text="Commence par créer une journée de remplacement depuis l'onglet Journées ou Agenda." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ ...glass(T), padding: 16 }}>
            <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Cette semaine</div>
            {weekJournees.length === 0 ? (
              upcoming ? (
                <div>
                  <div style={{ fontSize: 12.5, color: T.faint, marginBottom: 8 }}>Rien cette semaine — ta prochaine journée :</div>
                  <JourneeRow j={upcoming} cabinetOf={cabinetOf} revenue={revenue} netOf={netOf} onOpen={onOpen} />
                </div>
              ) : (
                <div style={{ fontSize: 13, color: T.faint }}>Aucune journée prévue pour l'instant.</div>
              )
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {weekJournees.map((j) => {
                  const cab = cabinetOf(j.cabinetId);
                  const isToday = j.date === todayISO();
                  const isPast = j.date < todayISO();
                  return (
                    <button key={j.id} onClick={() => onOpen(j.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: isToday ? T.accent + "14" : T.bg2, border: `1px solid ${isToday ? T.accent + "44" : T.line}`, cursor: "pointer", textAlign: "left", opacity: isPast && !isToday ? 0.6 : 1 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: cab?.color || T.faint, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", minWidth: 92 }}>{new Date(j.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
                      <span style={{ flex: 1, fontSize: 12.5, color: T.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cab?.name || "Sans cabinet"}</span>
                      {j.patients.length > 0 && <b style={{ fontSize: 12.5, color: T.accent }}>{eur(revenue(j))}</b>}
                      {isToday && <span style={{ fontSize: 10.5, fontWeight: 700, color: T.accent, textTransform: "uppercase" }}>Aujourd'hui</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {best && revenue(best) > 0 && (
            <div style={{ ...glass(T), padding: 16 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={13} color={T.accent} /> Ta meilleure journée</div>
              <JourneeRow j={best} cabinetOf={cabinetOf} revenue={revenue} netOf={netOf} onOpen={onOpen} />
            </div>
          )}
          <button onClick={() => goTo("journees")} className="lift" style={{ ...glass(T), padding: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: T.accent, fontWeight: 600, border: `1px solid ${T.line}` }}>
            Voir toutes les journées <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function JourneeRow({ j, cabinetOf, revenue, netOf, onOpen }) {
  const T = useT();
  const cab = cabinetOf(j.cabinetId);
  const rev = revenue(j);
  return (
    <button onClick={() => onOpen(j.id)} className="rowh lift" style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: T.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 13, padding: 4 }}>
      <div style={{ width: 4, height: 40, borderRadius: 3, background: cab?.color || T.faint, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{fmtDate(j.date)}</div>
        <div style={{ fontSize: 12.5, color: T.sub }}>{cab?.name || "Sans cabinet"} · {j.patients.length} patient{j.patients.length > 1 ? "s" : ""}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 700, color: T.accent }}>{eur(rev)}</div>
        <div style={{ fontSize: 11.5, color: T.faint }}>net {eur(netOf(j))}</div>
      </div>
      <ChevronRight size={16} color={T.faint} />
    </button>
  );
}

/* ============================================================
   JOURNEES LIST
   ============================================================ */
function JourneesList({ journees, setJournees, cabinets, cabinetOf, revenue, netOf, ensureCabinet, deleteJournee, onOpen }) {
  const T = useT();
  const confirm = useConfirm();
  const [creating, setCreating] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [cabinetId, setCabinetId] = useState("");
  const [newCabinet, setNewCabinet] = useState("");

  const create = () => {
    let cid = cabinetId;
    if (cabinetId === "__new__") cid = ensureCabinet(newCabinet);
    const jn = { id: uid(), date, cabinetId: cid || null, hours: null, patients: [], created: Date.now() };
    setJournees((js) => [jn, ...js]);
    setCreating(false); setCabinetId(""); setNewCabinet(""); setDate(todayISO());
    onOpen(jn.id);
  };
  const sorted = [...journees].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="fadeUp">
      <SectionHead title="Journées" subtitle="Une journée = un jour de remplacement."
        action={<PrimaryBtn onClick={() => setCreating(true)}><Play size={16} /> Nouvelle journée</PrimaryBtn>} />

      {creating && (
        <div style={{ ...glass(T), padding: 16, marginBottom: 16 }} className="fadeUp">
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle(T)} /></Field>
            <Field label="Cabinet">
              <select value={cabinetId} onChange={(e) => setCabinetId(e.target.value)} style={inputStyle(T)}>
                <option value="">— Choisir —</option>
                {cabinets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Nouveau cabinet…</option>
              </select>
            </Field>
          </div>
          {cabinetId === "__new__" && (
            <Field label="Nom du nouveau cabinet"><input value={newCabinet} onChange={(e) => setNewCabinet(e.target.value)} autoFocus placeholder="Ex. Cabinet Dr. Martin — Blagnac" style={inputStyle(T)} onKeyDown={(e) => e.key === "Enter" && newCabinet.trim() && create()} /></Field>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <GhostBtn onClick={() => setCreating(false)}>Annuler</GhostBtn>
            <PrimaryBtn onClick={create} disabled={cabinetId === "__new__" && !newCabinet.trim()}><Check size={16} /> Créer</PrimaryBtn>
          </div>
        </div>
      )}

      {sorted.length === 0 && !creating && <Empty icon={Calendar} title="Aucune journée" text="Crée ta première journée pour enregistrer patients et actes." />}

      <div style={{ display: "grid", gap: 11 }}>
        {sorted.map((j) => {
          const cab = cabinetOf(j.cabinetId); const rev = revenue(j);
          const nP = j.patients.length, nA = j.patients.reduce((a, p) => a + p.acts.length, 0);
          return (
            <div key={j.id} className="rowh" style={{ ...glass(T), padding: 0, display: "flex", alignItems: "stretch", color: T.text, width: "100%", overflow: "hidden" }}>
              <div style={{ width: 5, background: cab?.color || T.faint, flexShrink: 0 }} />
              <button onClick={() => onOpen(j.id)} className="lift" style={{ display: "flex", alignItems: "center", gap: 15, padding: 16, flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", color: T.text, textAlign: "left" }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: T.bg2, border: `1px solid ${T.line}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{j.date.slice(8)}</div>
                    <div style={{ fontSize: 9.5, color: T.faint, textTransform: "uppercase" }}>{new Date(j.date + "T00:00:00").toLocaleDateString("fr-FR", { month: "short" })}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, textTransform: "capitalize" }}>{fmtDate(j.date)}</div>
                  <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cab && <span style={{ width: 8, height: 8, borderRadius: 2, background: cab.color, flexShrink: 0 }} />}
                    {cab?.name || "Sans cabinet"} · {nP} pat. · {nA} acte{nA > 1 ? "s" : ""}{j.hours ? ` · ${j.hours}h` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: T.accent }}>{eur(rev)}</div>
                  <div style={{ fontSize: 11.5, color: T.faint }}>net {eur(netOf(j))}</div>
                </div>
              </button>
              <button onClick={async () => { if (await confirm("Supprimer cette journée et tout ce qu'elle contient ?")) deleteJournee(j.id); }} title="Supprimer" className="lift" style={{ padding: "0 16px", background: "none", border: "none", borderLeft: `1px solid ${T.line}`, cursor: "pointer", color: T.rose, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   JOURNEE DETAIL
   ============================================================ */
function JourneeDetail({ journee, cabinets, cabinetOf, practices, priceOf, nameOf, revenue, netOf, ensureCabinet, favoritePractices, onBack, onUpdate, onDelete, onDuplicate }) {
  const T = useT();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const [editHours, setEditHours] = useState(false);
  const [hoursVal, setHoursVal] = useState(journee?.hours ?? "");
  const [editCab, setEditCab] = useState(false);
  const [editDate, setEditDate] = useState(false);
  if (!journee) return null;

  const cab = cabinetOf(journee.cabinetId);
  const rev = revenue(journee);
  const cut = cab ? cab.cut : 0.30;
  const perHour = journee.hours ? rev / journee.hours : null;

  const addPatient = (pt) => { onUpdate({ ...journee, patients: [...journee.patients, pt] }); setAdding(false); };
  const updatePatient = (pt) => onUpdate({ ...journee, patients: journee.patients.map((p) => p.id === pt.id ? pt : p) });
  const removePatient = (id) => onUpdate({ ...journee, patients: journee.patients.filter((p) => p.id !== id) });
  const saveHours = () => { onUpdate({ ...journee, hours: hoursVal ? Number(hoursVal) : null }); setEditHours(false); };

  return (
    <div className="fadeUp">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: 0 }}><ArrowLeft size={16} /> Toutes les journées</button>
        <div style={{ display: "flex", gap: 8 }}>
          {journee.patients.length > 0 && <IconBtn title="Dupliquer cette journée (aujourd'hui)" onClick={() => onDuplicate(journee)}><Copy size={16} /></IconBtn>}
          <IconBtn danger title="Supprimer cette journée" onClick={async () => { if (await confirm("Supprimer définitivement cette journée et tous ses patients ?")) onDelete(journee.id); }}><Trash2 size={16} /></IconBtn>
        </div>
      </div>

      <div style={{ ...glass(T), padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: 5, background: cab?.color || T.faint }} />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>Journée du</div>
              {editDate ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <input type="date" value={journee.date} onChange={(e) => { if (e.target.value) onUpdate({ ...journee, date: e.target.value }); }} style={{ ...inputStyle(T), width: "auto" }} autoFocus />
                  <IconBtn title="OK" onClick={() => setEditDate(false)}><Check size={15} color={T.accent} /></IconBtn>
                </div>
              ) : (
                <button onClick={() => setEditDate(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.text, padding: 0, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, textTransform: "capitalize" }}>{fmtDate(journee.date)}</span>
                  <Pencil size={13} color={T.faint} />
                </button>
              )}
              {editCab ? (
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={journee.cabinetId || ""} onChange={(e) => { onUpdate({ ...journee, cabinetId: e.target.value || null }); setEditCab(false); }} style={{ ...inputStyle(T), width: "auto" }}>
                    <option value="">Sans cabinet</option>
                    {cabinets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <IconBtn title="Fermer" onClick={() => setEditCab(false)}><X size={15} /></IconBtn>
                </div>
              ) : (
                <button onClick={() => setEditCab(true)} style={{ marginTop: 4, background: "none", border: "none", cursor: "pointer", color: T.sub, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7, padding: 0 }}>
                  {cab && <span style={{ width: 9, height: 9, borderRadius: 2, background: cab.color }} />}
                  {cab?.name || "Associer un cabinet"} <Pencil size={12} />
                </button>
              )}
            </div>
            <Stat mini label="Patients" value={journee.patients.length} color={T.violet} />
            <Stat mini label="CA brut" value={eur(rev)} color={T.accent} />
            <Stat mini label={`Net −${Math.round(cut * 100)}%`} value={eur(rev * (1 - cut))} color={T.amber} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.bg2, border: `1px solid ${T.line}` }}>
            <Clock size={17} color={T.sky} />
            {editHours ? (
              <>
                <span style={{ fontSize: 14, color: T.sub }}>Heures :</span>
                <input value={hoursVal} onChange={(e) => setHoursVal(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))} placeholder="Ex. 7" style={{ ...inputStyle(T), width: 90 }} inputMode="decimal" autoFocus onKeyDown={(e) => e.key === "Enter" && saveHours()} />
                <span style={{ color: T.faint }}>h</span><div style={{ flex: 1 }} />
                <IconBtn title="OK" onClick={saveHours}><Check size={16} color={T.accent} /></IconBtn>
                <IconBtn title="Annuler" onClick={() => { setEditHours(false); setHoursVal(journee.hours ?? ""); }}><X size={16} /></IconBtn>
              </>
            ) : (
              <>
                <div style={{ flex: 1, fontSize: 14 }}>
                  {journee.hours ? <span>Journée de <b>{journee.hours}h</b>{perHour != null && <span style={{ color: T.sub }}> · <b style={{ color: T.accent }}>{eur(perHour)}/h</b> brut</span>}</span> : <span style={{ color: T.faint }}>Durée non renseignée</span>}
                </div>
                <GhostBtn onClick={() => { setHoursVal(journee.hours ?? ""); setEditHours(true); }}><Timer size={15} /> {journee.hours ? "Modifier" : "Ajouter les heures"}</GhostBtn>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            <button onClick={() => onUpdate({ ...journee, paid: !journee.paid })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, cursor: "pointer", flex: 1, minWidth: 150, border: `1px solid ${journee.paid ? T.accent + "55" : T.line}`, background: journee.paid ? T.accent + "14" : T.bg2, color: journee.paid ? T.accent : T.sub, fontWeight: 600, fontSize: 13.5 }}>
              {journee.paid ? <Check size={16} /> : <Euro size={16} />} {journee.paid ? "Payée" : "Marquer comme payée"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg2 }}>
              <span style={{ fontSize: 12, color: T.faint, marginRight: 4 }}>Ambiance</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => onUpdate({ ...journee, ambiance: journee.ambiance === n ? null : n })} title={`${n}/5`}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, padding: "2px 1px", opacity: journee.ambiance != null && n <= journee.ambiance ? 1 : 0.28 }}>
                  ⭐
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SectionHead title="Patients" small action={<PrimaryBtn onClick={() => setAdding(true)}><Plus size={16} /> Ajouter un patient</PrimaryBtn>} />
      {adding && <PatientEditor practices={practices} favorites={favoritePractices} onCancel={() => setAdding(false)} onSave={addPatient} />}
      {journee.patients.length === 0 && !adding && <Empty icon={Users} title="Pas encore de patient" text="Ajoute un patient et sélectionne les actes réalisés." />}
      <div style={{ display: "grid", gap: 11 }}>
        {journee.patients.map((pt, i) => <PatientCard key={pt.id} patient={pt} index={i + 1} practices={practices} favorites={favoritePractices} priceOf={priceOf} nameOf={nameOf} onChange={updatePatient} onRemove={() => removePatient(pt.id)} />)}
      </div>
    </div>
  );
}

function PatientCard({ patient, index, practices, favorites, priceOf, nameOf, onChange, onRemove }) {
  const T = useT();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const total = patient.acts.reduce((a, act) => a + (act.price ?? priceOf(act.practiceId)), 0);
  if (editing) return <PatientEditor practices={practices} favorites={favorites} initial={patient} onCancel={() => setEditing(false)} onSave={(p) => { onChange(p); setEditing(false); }} />;
  return (
    <div style={{ ...glass(T), padding: 15 }} className="fadeUp">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: patient.acts.length ? 11 : 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: T.violet + "22", color: T.violet, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{index}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>{patient.name || `Patient ${index}`}</div>
          <div style={{ fontSize: 12, color: T.faint, display: "flex", gap: 10 }}>
            <span>{patient.acts.length} acte{patient.acts.length > 1 ? "s" : ""}</span>
            {patient.minutes ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {patient.minutes} min</span> : null}
          </div>
        </div>
        <div style={{ fontWeight: 700, color: T.accent, fontSize: 15 }}>{eur(total)}</div>
        <IconBtn title="Modifier" onClick={() => setEditing(true)}><Pencil size={15} /></IconBtn>
        <IconBtn danger title="Supprimer" onClick={async () => { if (await confirm("Supprimer ce patient ?")) onRemove(); }}><Trash2 size={15} /></IconBtn>
      </div>
      {patient.acts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {patient.acts.map((act, i) => (
            <span key={i} style={{ fontSize: 12.5, padding: "5px 10px", borderRadius: 8, background: T.accent + "1f", border: `1px solid ${T.line}`, display: "flex", gap: 6, alignItems: "center" }}>
              {nameOf(act.practiceId)} <b style={{ color: T.accent }}>{eur(act.price ?? priceOf(act.practiceId))}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PatientEditor({ practices, favorites = [], initial, onCancel, onSave }) {
  const T = useT();
  const [name, setName] = useState(initial?.name || "");
  const [minutes, setMinutes] = useState(initial?.minutes || "");
  const [acts, setActs] = useState(initial?.acts?.map((a) => ({ ...a })) || []);
  const [q, setQ] = useState("");
  const searchRef = useRef(null);
  useEffect(() => { searchRef.current?.focus(); }, []);
  const filtered = practices.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const total = acts.reduce((s, a) => s + (a.price || 0), 0);
  const addAct = (p) => setActs((a) => [...a, { practiceId: p.id, price: p.price }]);
  const favPractices = favorites.map((id) => practices.find((p) => p.id === id)).filter(Boolean);
  return (
    <div style={{ ...glass(T), padding: 16, marginBottom: 12, borderColor: T.line2 }} className="fadeUp">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, marginBottom: 13 }}>
        <Field label="Nom / réf. (optionnel)"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. M.D. ou réf. 3" style={inputStyle(T)} /></Field>
        <Field label="Temps (min)"><input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/[^\d]/g, ""))} placeholder="—" style={inputStyle(T)} inputMode="numeric" /></Field>
      </div>

      {favPractices.length > 0 && (
        <>
          <div style={{ fontSize: 11.5, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Star size={12} color={T.amber} /> Accès rapide</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {favPractices.map((p) => (
              <button key={p.id} onClick={() => addAct(p)} className="lift" style={{ fontSize: 13, padding: "7px 11px", borderRadius: 9, background: T.bg2, border: `1px solid ${T.line2}`, color: T.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                <Plus size={13} color={T.accent} /> {p.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: 11.5, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Actes réalisés</div>
      {acts.length === 0 ? <div style={{ color: T.faint, fontSize: 13, marginBottom: 12 }}>Aucun acte — utilise l'accès rapide ou cherche ci-dessous.</div>
        : <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {acts.map((a, i) => { const p = practices.find((x) => x.id === a.practiceId); return (
              <span key={i} style={{ fontSize: 13, padding: "6px 8px 6px 12px", borderRadius: 9, background: T.accent, color: T.accentInk, display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
                {p?.name || "?"} · {eur(a.price)}
                <button onClick={() => setActs((x) => x.filter((_, idx) => idx !== i))} style={{ background: "rgba(0,0,0,0.15)", border: "none", borderRadius: 6, width: 19, height: 19, display: "grid", placeItems: "center", cursor: "pointer", color: T.accentInk }}><X size={12} /></button>
              </span>); })}
          </div>}
      <div style={{ position: "relative", marginBottom: 6 }}>
        <Search size={16} color={T.faint} style={{ position: "absolute", left: 12, top: 13 }} />
        <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une pratique…" style={{ ...inputStyle(T), paddingLeft: 36 }} />
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 12, marginBottom: 13 }}>
        {filtered.length === 0 && <div style={{ padding: 14, color: T.faint, fontSize: 13 }}>Aucune pratique trouvée.</div>}
        {filtered.map((p) => (
          <button key={p.id} onClick={() => addAct(p)} className="rowh" style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${T.line}`, color: T.text, cursor: "pointer", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Plus size={15} color={T.accent} /><span style={{ flex: 1 }}>{p.name}</span><b style={{ color: T.accent }}>{eur(p.price)}</b>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, fontSize: 14, color: T.sub }}>Total : <b style={{ color: T.accent, fontSize: 16 }}>{eur(total)}</b></div>
        <GhostBtn onClick={onCancel}>Annuler</GhostBtn>
        <PrimaryBtn onClick={() => onSave({ id: initial?.id || uid(), name: name.trim(), minutes: minutes ? Number(minutes) : null, acts })}><Check size={16} /> {initial ? "Enregistrer" : "Ajouter"}</PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   AGENDA — calendrier plein, barres multi-jours (style image)
   ============================================================ */
const pastel = (hex, T) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const mix = (c, d, t) => Math.round(c * (1 - t) + d * t);
  if (T.dark) return `rgb(${mix(r, 20, 0.72)},${mix(g, 26, 0.72)},${mix(b, 40, 0.72)})`;
  const t = 0.72;
  return `rgb(${mix(r, 255, t)},${mix(g, 255, t)},${mix(b, 255, t)})`;
};

function AgendaView({ journees, remplas, cabinets, cabinetOf, revenue, createRempla, updateRempla, deleteRempla, deleteJournee, deleteJournees, datesBetween, ensureCabinet, onOpen }) {
  const T = useT();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [composer, setComposer] = useState(null);
  const [detail, setDetail] = useState(null);

  const first = new Date(cursor.y, cursor.m, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const today = todayISO();
  const prev = () => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const next = () => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });
  const goToday = () => { const d = new Date(); setCursor({ y: d.getFullYear(), m: d.getMonth() }); };

  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const gridStart = new Date(cursor.y, cursor.m, 1 - startWeekday);
  const days = [];
  for (let i = 0; i < totalCells; i++) { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); days.push(d); }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const inMonth = (d) => d.getMonth() === cursor.m;

  const revByDate = useMemo(() => { const m = {}; for (const j of journees) m[j.date] = (m[j.date] || 0) + revenue(j); return m; }, [journees, revenue]);

  const monthStart = iso(new Date(cursor.y, cursor.m, 1));
  const monthEnd = iso(new Date(cursor.y, cursor.m + 1, 0));
  const monthKeyStr = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
  const monthJournees = journees.filter((j) => monthKey(j.date) === monthKeyStr);
  const monthBrut = monthJournees.reduce((s, j) => s + revenue(j), 0);

  // SOURCE UNIQUE : les barres sont dérivées UNIQUEMENT des journées existantes,
  // regroupées en périodes consécutives par cabinet. Un rempla ne sert qu'à créer
  // des journées en masse et à porter une note — il n'est jamais affiché seul.
  // Conséquence : toute suppression/ajout/déplacement de journée se reflète
  // instantanément et exactement dans l'agenda. Zéro désynchro possible.
  const blocks = useMemo(() => {
    const out = [];
    const sorted = [...journees].sort((a, b) => a.date < b.date ? -1 : 1);
    const byCab = {};
    for (const j of sorted) (byCab[j.cabinetId || "none"] ||= []).push(j);
    for (const cabKey of Object.keys(byCab)) {
      const list = byCab[cabKey];
      let runStart = null, prev = null, runJournees = [];
      const flush = () => {
        if (!runStart) return;
        // rattacher la note du rempla si toutes les journées du run en partagent un
        const remplaIds = [...new Set(runJournees.map((j) => j.remplaId).filter(Boolean))];
        const rempla = remplaIds.length === 1 ? remplas.find((r) => r.id === remplaIds[0]) || null : null;
        out.push({ cabinetId: cabKey === "none" ? null : cabKey, start: runStart, end: prev, journees: runJournees.slice(), rempla });
      };
      for (const j of list) {
        if (!runStart) { runStart = j.date; runJournees = [j]; }
        else {
          const gap = datesBetween(prev, j.date);
          if (gap.length === 2) { runJournees.push(j); } // jour consécutif
          else { flush(); runStart = j.date; runJournees = [j]; }
        }
        prev = j.date;
      }
      flush();
    }
    return out;
  }, [journees, remplas]);

  const weekSegments = (week) => {
    const wStart = iso(week[0]); const wEnd = iso(week[6]);
    const segs = [];
    for (const b of blocks) {
      if (b.end < wStart || b.start > wEnd) continue;
      const s = b.start < wStart ? wStart : b.start;
      const e = b.end > wEnd ? wEnd : b.end;
      const colStart = week.findIndex((d) => iso(d) === s);
      const colEnd = week.findIndex((d) => iso(d) === e);
      if (colStart === -1 || colEnd === -1) continue;
      segs.push({ block: b, colStart, span: colEnd - colStart + 1, isStart: b.start === s, isEnd: b.end === e });
    }
    segs.sort((a, b) => a.colStart - b.colStart || b.span - a.span);
    const lanes = [];
    for (const seg of segs) {
      let lane = 0;
      while (lanes[lane] && lanes[lane].some((o) => !(seg.colStart + seg.span - 1 < o.colStart || seg.colStart > o.colStart + o.span - 1))) lane++;
      (lanes[lane] ||= []).push(seg); seg.lane = lane;
    }
    return { segs, laneCount: Math.max(lanes.length, 0) };
  };

  return (
    <div className="fadeUp">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, textTransform: "capitalize", letterSpacing: -0.3 }}>{monthLabel}</h2>
          <div style={{ color: T.sub, fontSize: 13.5, marginTop: 2 }}>{monthJournees.length} journée{monthJournees.length > 1 ? "s" : ""} · {eur(monthBrut)} brut</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <IconBtn title="Mois précédent" onClick={prev}><ChevronLeft size={18} /></IconBtn>
          <GhostBtn onClick={goToday}>Aujourd'hui</GhostBtn>
          <IconBtn title="Mois suivant" onClick={next}><ChevronRight size={18} /></IconBtn>
          <PrimaryBtn onClick={() => setComposer({ start: today, end: today })}><Plus size={16} /> Rempla</PrimaryBtn>
        </div>
      </div>

      {cabinets.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12, padding: "8px 12px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 11 }}>
          {cabinets.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.sub }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
              {c.name}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...glass(T), padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${T.line}` }}>
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, color: T.faint, fontWeight: 600, padding: "10px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => {
          const { segs, laneCount } = weekSegments(week);
          const NUM_BAND = 34;              // bande réservée au numéro du jour
          const LANE_H = 26;
          const barsAreaH = laneCount * LANE_H + 4;
          return (
            <div key={wi} style={{ position: "relative", borderBottom: wi < weeks.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {week.map((d, di) => {
                  const ds = iso(d); const isToday = ds === today; const off = !inMonth(d);
                  const isWeekend = di === 5 || di === 6;
                  const dayRev = revByDate[ds] || 0;
                  return (
                    <button key={di} onClick={() => setComposer({ start: ds, end: ds })} className="rowh" style={{
                      textAlign: "left",
                      background: off ? (T.dark ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.02)") : (isWeekend ? (T.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.012)") : "transparent"),
                      border: isToday ? `1px solid ${T.accent}44` : "none", borderRight: di < 6 ? `1px solid ${T.line}` : "none", cursor: "pointer",
                      padding: 0, position: "relative", color: T.text,
                      minHeight: NUM_BAND + barsAreaH + 24,
                    }}>
                      {/* bande numéro, toujours au-dessus des barres */}
                      <div style={{ height: NUM_BAND, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 8px", position: "relative", zIndex: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: isToday ? 700 : 500, color: off ? T.faint : (isToday ? T.accentInk : T.text), background: isToday ? T.accent : "transparent", width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center" }}>{d.getDate()}</span>
                      </div>
                      {dayRev > 0 && <div style={{ position: "absolute", bottom: 5, left: 8, fontSize: 9.5, color: T.faint, zIndex: 3 }}>{eur0(dayRev)}</div>}
                    </button>
                  );
                })}
              </div>
              <div style={{ position: "absolute", top: NUM_BAND, left: 0, right: 0, height: barsAreaH, pointerEvents: "none", zIndex: 2 }}>
                {segs.map((seg, si) => {
                  const b = seg.block;
                  const cab = cabinetOf(b.cabinetId);
                  const color = cab?.color || T.faint;
                  const leftPct = (seg.colStart / 7) * 100;
                  const widthPct = (seg.span / 7) * 100;
                  return (
                    <button key={si} onClick={() => setDetail(b)} className="lift" style={{
                      pointerEvents: "auto", position: "absolute",
                      left: `calc(${leftPct}% + 4px)`, width: `calc(${widthPct}% - 8px)`,
                      top: seg.lane * LANE_H, height: 22, cursor: "pointer",
                      background: `linear-gradient(135deg, ${pastel(color, T)}, ${pastel(color, T)}cc)`, color: T.dark ? T.text : "#2A2A2A", border: "none",
                      boxShadow: `0 1px 3px ${color}22`,
                      borderTopLeftRadius: seg.isStart ? 7 : 0, borderBottomLeftRadius: seg.isStart ? 7 : 0,
                      borderTopRightRadius: seg.isEnd ? 7 : 0, borderBottomRightRadius: seg.isEnd ? 7 : 0,
                      borderLeft: seg.isStart ? `3px solid ${color}` : "none",
                      display: "flex", alignItems: "center", padding: "0 8px",
                      fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {seg.isStart ? (cab?.name || "Journée") : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, color: T.faint, marginTop: 12, textAlign: "center" }}>Touche un jour pour créer un rempla, ou une barre pour l'ouvrir.</div>

      {composer && (
        <RemplaComposer initial={composer} cabinets={cabinets} onCancel={() => setComposer(null)}
          onSave={({ cabinetId, newCabinetName, start, end, note, hours }) => {
            let cid = cabinetId;
            if (cabinetId === "__new__") cid = ensureCabinet(newCabinetName);
            createRempla({ cabinetId: cid, start, end, note, hours });
            setComposer(null);
          }} />
      )}
      {detail && (
        <BlockDetail block={detail} cabinetOf={cabinetOf} journees={journees} revenue={revenue}
          datesBetween={datesBetween} onOpenJournee={onOpen} onClose={() => setDetail(null)}
          onUpdateRempla={(patch) => { if (detail.rempla) { updateRempla(detail.rempla.id, patch); setDetail({ ...detail, rempla: { ...detail.rempla, ...patch } }); } }}
          onDeleteBlock={() => {
            deleteJournees(detail.journees.map((j) => j.id));
            setDetail(null);
          }}
          onDeleteJournee={(jid) => {
            deleteJournee(jid);
            setDetail(null); // le bloc change de forme ; on referme proprement
          }} />
      )}
    </div>
  );
}

function RemplaComposer({ initial, cabinets, onCancel, onSave }) {
  const T = useT();
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end || initial.start);
  const [cabinetId, setCabinetId] = useState(cabinets[0]?.id || "__new__");
  const [newCab, setNewCab] = useState("");
  const [note, setNote] = useState("");
  const [hours, setHours] = useState("");
  const canSave = start && end && end >= start && (cabinetId !== "__new__" || newCab.trim());

  return (
    <Modal onClose={onCancel} title="Nouveau remplacement">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Du"><input type="date" value={start} onChange={(e) => { setStart(e.target.value); if (end < e.target.value) setEnd(e.target.value); }} style={inputStyle(T)} /></Field>
          <Field label="Au"><input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle(T)} /></Field>
        </div>
        <Field label="Cabinet">
          <select value={cabinetId} onChange={(e) => setCabinetId(e.target.value)} style={inputStyle(T)}>
            {cabinets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__new__">+ Nouveau cabinet…</option>
          </select>
        </Field>
        {cabinetId === "__new__" && (
          <Field label="Nom du nouveau cabinet"><input value={newCab} onChange={(e) => setNewCab(e.target.value)} autoFocus placeholder="Ex. Cabinet Dr. Martin — Toulouse" style={inputStyle(T)} /></Field>
        )}
        <Field label="Note (optionnel)"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. matins uniquement, code porte…" style={inputStyle(T)} /></Field>
        <Field label="Heures par jour (optionnel)"><input value={hours} onChange={(e) => setHours(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))} placeholder="Ex. 7" style={inputStyle(T)} inputMode="decimal" /></Field>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
        <GhostBtn onClick={onCancel}>Annuler</GhostBtn>
        <PrimaryBtn disabled={!canSave} onClick={() => onSave({ cabinetId, newCabinetName: cabinetId === "__new__" ? newCab.trim() : null, start, end, note, hours: hours ? Number(hours) : null })}><Check size={16} /> Créer le rempla</PrimaryBtn>
      </div>
    </Modal>
  );
}

function BlockDetail({ block, cabinetOf, journees, revenue, datesBetween, onOpenJournee, onClose, onUpdateRempla, onDeleteBlock, onDeleteJournee }) {
  const T = useT();
  const confirm = useConfirm();
  const isRempla = block.rempla != null; // note de rempla rattachée
  const rempla = block.rempla;
  const cab = cabinetOf(block.cabinetId);
  // les jours affichés = exactement les journées du bloc (source unique)
  const dates = block.journees.map((j) => j.date).sort();
  const total = block.journees.reduce((s, j) => s + revenue(j), 0);
  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState(rempla?.note || "");

  return (
    <Modal onClose={onClose} title={cab?.name || "Journées"} accent={cab?.color}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: T.sub, fontSize: 14 }}>
        <CalendarDays size={16} color={cab?.color || T.accent} />
        {block.start === block.end ? fmtDate(block.start) : `${fmtShort(block.start)} → ${fmtShort(block.end)}`}
        <span style={{ marginLeft: "auto", fontWeight: 700, color: T.accent }}>{eur(total)}</span>
      </div>

      {isRempla && (
        <div style={{ marginBottom: 14 }}>
          {editNote ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} autoFocus placeholder="Note…" style={{ ...inputStyle(T), flex: 1 }} onKeyDown={(e) => e.key === "Enter" && (onUpdateRempla({ note: note.trim() }), setEditNote(false))} />
              <IconBtn title="OK" onClick={() => { onUpdateRempla({ note: note.trim() }); setEditNote(false); }}><Check size={16} color={T.accent} /></IconBtn>
            </div>
          ) : (
            <button onClick={() => setEditNote(true)} className="rowh" style={{ width: "100%", textAlign: "left", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", color: rempla?.note ? T.text : T.faint, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <Pencil size={13} /> {rempla?.note || "Ajouter une note"}
            </button>
          )}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Jours — touche pour ouvrir, corbeille pour supprimer</div>
      <div style={{ display: "grid", gap: 7, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
        {block.journees.slice().sort((a, b) => a.date < b.date ? -1 : 1).map((j) => {
          const rev = revenue(j);
          return (
            <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg2 }}>
              <span style={{ width: 4, height: 30, borderRadius: 3, background: cab?.color || T.faint, flexShrink: 0 }} />
              <button onClick={() => onOpenJournee(j.id)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: T.text, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, textTransform: "capitalize" }}>{new Date(j.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}</div>
                <div style={{ fontSize: 12, color: T.faint }}>{j.patients.length} patient{j.patients.length > 1 ? "s" : ""}</div>
              </button>
              <span style={{ fontWeight: 700, color: T.accent, fontSize: 14 }}>{eur(rev)}</span>
              <IconBtn danger title="Supprimer ce jour" onClick={async () => { if (await confirm("Supprimer cette journée et tout ce qu'elle contient ?")) onDeleteJournee(j.id); }}><Trash2 size={14} /></IconBtn>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button onClick={async () => {
          if (await confirm("Supprimer toutes ces journées" + (isRempla ? " (le rempla sera retiré aussi)" : "") + " ?")) onDeleteBlock();
        }} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${T.rose}44`, color: T.rose, borderRadius: 11, padding: "10px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}>
          <Trash2 size={15} /> Tout supprimer
        </button>
        <PrimaryBtn onClick={onClose}>Fermer</PrimaryBtn>
      </div>
    </Modal>
  );
}

function Modal({ children, title, onClose, accent }) {
  const T = useT();
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", padding: 16, background: T.dark ? "rgba(6,10,18,0.7)" : "rgba(40,50,65,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "fade .18s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", borderRadius: 18, border: `1px solid ${T.line2}`, background: T.cardSolid }} className="pop">
        {accent && <div style={{ height: 5, background: accent }} />}
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
            <IconBtn title="Fermer" onClick={onClose}><X size={17} /></IconBtn>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PRACTICES MANAGER
   ============================================================ */
function PracticesManager({ practices, setPractices }) {
  const T = useT();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState(""); const [newPrice, setNewPrice] = useState("");
  const [editId, setEditId] = useState(null); const [eName, setEName] = useState(""); const [ePrice, setEPrice] = useState("");
  const add = () => { if (!newName.trim()) return; setPractices((p) => [...p, { id: uid(), name: newName.trim(), price: Number(newPrice) || 0 }]); setNewName(""); setNewPrice(""); };
  const saveEdit = () => { setPractices((l) => l.map((p) => p.id === editId ? { ...p, name: eName.trim() || p.name, price: Number(ePrice) || 0 } : p)); setEditId(null); };
  const filtered = practices.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fadeUp">
      <SectionHead title="Base de pratiques" subtitle="Ta grille tarifaire, modifiable à volonté." />
      <div style={{ fontSize: 12, color: T.faint, background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 13, lineHeight: 1.5 }}>
        💡 Les tarifs par défaut sont basés sur les bases CCAM/NGAP 2026 (ameli.fr). Ce sont des points de départ éditables — ajuste-les aux tarifs réels de chaque cabinet (dépassements, secteur 2, actes hors nomenclature).
      </div>
      <div style={{ ...glass(T), padding: 15, marginBottom: 15 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px auto", gap: 10, alignItems: "end" }}>
          <Field label="Nom"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. Blanchiment" style={inputStyle(T)} onKeyDown={(e) => e.key === "Enter" && add()} /></Field>
          <Field label="Prix (€)"><input value={newPrice} onChange={(e) => setNewPrice(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))} placeholder="0.00" style={inputStyle(T)} inputMode="decimal" onKeyDown={(e) => e.key === "Enter" && add()} /></Field>
          <PrimaryBtn onClick={add} disabled={!newName.trim()}><Plus size={16} /> Ajouter</PrimaryBtn>
        </div>
      </div>
      <div style={{ position: "relative", marginBottom: 13 }}>
        <Search size={16} color={T.faint} style={{ position: "absolute", left: 12, top: 13 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" style={{ ...inputStyle(T), paddingLeft: 36 }} />
      </div>
      <div style={{ ...glass(T), padding: 6 }}>
        <div style={{ display: "flex", padding: "8px 14px", fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>
          <span style={{ flex: 1 }}>Pratique ({filtered.length})</span><span style={{ width: 120, textAlign: "right" }}>Prix</span><span style={{ width: 86 }} />
        </div>
        {filtered.map((p) => (
          <div key={p.id} className="rowh" style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderRadius: 10, gap: 10 }}>
            {editId === p.id ? (
              <>
                <input value={eName} onChange={(e) => setEName(e.target.value)} style={{ ...inputStyle(T), flex: 1 }} autoFocus />
                <input value={ePrice} onChange={(e) => setEPrice(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))} style={{ ...inputStyle(T), width: 110, textAlign: "right" }} inputMode="decimal" />
                <IconBtn title="OK" onClick={saveEdit}><Check size={16} color={T.accent} /></IconBtn>
                <IconBtn title="Annuler" onClick={() => setEditId(null)}><X size={16} /></IconBtn>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ width: 120, textAlign: "right", fontWeight: 600, color: T.accent }}>{eur(p.price)}</span>
                <IconBtn title="Modifier" onClick={() => { setEditId(p.id); setEName(p.name); setEPrice(String(p.price)); }}><Pencil size={15} /></IconBtn>
                <IconBtn danger title="Supprimer" onClick={async () => { if (await confirm("Supprimer cette pratique ?")) setPractices((x) => x.filter((y) => y.id !== p.id)); }}><Trash2 size={15} /></IconBtn>
              </>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 18, color: T.faint, textAlign: "center", fontSize: 14 }}>Aucune pratique.</div>}
      </div>
    </div>
  );
}

/* ============================================================
   STATS (global + per cabinet)
   ============================================================ */
function StatsView({ journees, cabinets, cabinetOf, practices, priceOf, nameOf, revenue, netOf }) {
  const T = useT();
  const [scope, setScope] = useState("all"); // all | cabinetId

  const filtered = scope === "all" ? journees : journees.filter((j) => j.cabinetId === scope);

  const agg = useMemo(() => {
    let brut = 0, net = 0, patients = 0, acts = 0, hours = 0;
    const byPractice = {};
    for (const j of filtered) {
      brut += revenue(j); net += netOf(j); hours += j.hours || 0;
      for (const pt of j.patients) {
        patients++; const nA = pt.acts.length || 1;
        for (const a of pt.acts) {
          acts++; const price = a.price ?? priceOf(a.practiceId);
          const r = byPractice[a.practiceId] || { count: 0, revenue: 0, minutes: 0, timed: 0 };
          r.count++; r.revenue += price;
          if (pt.minutes) { r.minutes += pt.minutes / nA; r.timed++; }
          byPractice[a.practiceId] = r;
        }
      }
    }
    const rows = Object.entries(byPractice).map(([id, r]) => ({ id, name: nameOf(id), ...r, avgMin: r.timed ? r.minutes / r.timed : null, eurPerMin: r.minutes ? r.revenue / r.minutes : null })).sort((a, b) => b.revenue - a.revenue);
    return { brut, net, patients, acts, hours, rows };
  }, [filtered, revenue, netOf, priceOf, nameOf]);

  const evo = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => (a.date < b.date ? -1 : 1));
    let cum = 0;
    return sorted.map((j) => { cum += revenue(j); return { date: fmtShort(j.date), cumul: Math.round(cum * 100) / 100 }; });
  }, [filtered, revenue]);

  // per-cabinet breakdown (always global)
  const perCabinet = useMemo(() => {
    return cabinets.map((c) => {
      const js = journees.filter((j) => j.cabinetId === c.id);
      const brut = js.reduce((s, j) => s + revenue(j), 0);
      const net = js.reduce((s, j) => s + netOf(j), 0);
      const patients = js.reduce((s, j) => s + j.patients.length, 0);
      return { ...c, journees: js.length, brut, net, patients };
    }).filter((c) => c.journees > 0).sort((a, b) => b.brut - a.brut);
  }, [cabinets, journees, revenue, netOf]);

  const pieData = agg.rows.slice(0, 8).map((r) => ({ name: r.name, value: Math.round(r.revenue * 100) / 100, count: r.count }));
  const perHour = agg.hours ? agg.brut / agg.hours : null;
  const CH = [T.accent, T.violet, T.amber, T.sky, T.rose, "#7FE0C0", "#B79CFF", "#FFD08A"];

  return (
    <div className="fadeUp">
      <SectionHead title="Statistiques" subtitle="Vue d'ensemble, globale ou par cabinet." />

      {/* scope selector */}
      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
        <ScopeChip active={scope === "all"} onClick={() => setScope("all")} color={T.accent}>Tous</ScopeChip>
        {cabinets.filter((c) => journees.some((j) => j.cabinetId === c.id)).map((c) => (
          <ScopeChip key={c.id} active={scope === c.id} onClick={() => setScope(c.id)} color={c.color}>{c.name}</ScopeChip>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginBottom: 16 }}>
        <BigStat icon={Wallet} label="CA brut" value={eur(agg.brut)} color={T.accent} />
        <BigStat icon={Euro} label="CA net" value={eur(agg.net)} color={T.amber} />
        <BigStat icon={Users} label="Patients" value={agg.patients} color={T.violet} />
        <BigStat icon={Clock} label="€/heure" value={perHour != null ? eur(perHour) : "—"} color={T.sky} />
      </div>

      {/* per-cabinet cards (only in "all" scope) */}
      {scope === "all" && perCabinet.length > 0 && (
        <>
          <SectionHead title="Par cabinet" small />
          <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
            {perCabinet.map((c) => (
              <div key={c.id} style={{ ...glass(T), padding: 0, overflow: "hidden", display: "flex" }}>
                <div style={{ width: 5, background: c.color }} />
                <div style={{ padding: 15, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                    <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: T.faint }}>{c.journees} journée{c.journees > 1 ? "s" : ""} · −{Math.round(c.cut * 100)}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <Stat mini label="Brut" value={eur(c.brut)} color={T.accent} />
                    <Stat mini label="Net" value={eur(c.net)} color={T.amber} />
                    <Stat mini label="Patients" value={c.patients} color={T.violet} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {agg.rows.length === 0 ? <Empty icon={BarChart3} title="Pas encore de données" text="Enregistre des actes pour voir tes statistiques et graphiques." />
        : <>
            <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Répartition du CA par pratique</div>
              <div style={{ fontSize: 13, color: T.sub, marginBottom: 12 }}>Part de chaque acte dans le chiffre d'affaires.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
                <div style={{ width: 220, height: 220, flexShrink: 0 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={95} paddingAngle={2} stroke="none">
                        {pieData.map((_, i) => <Cell key={i} fill={CH[i % CH.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltip(T)} formatter={(v, n, p) => [`${eur(v)} · ${p.payload.count}×`, p.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 200, display: "grid", gap: 7 }}>
                  {pieData.map((d, i) => { const pct = agg.brut ? (d.value / agg.brut) * 100 : 0; return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                      <span style={{ width: 11, height: 11, borderRadius: 3, background: CH[i % CH.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                      <b>{pct.toFixed(1)}%</b>
                    </div>); })}
                </div>
              </div>
            </div>

            {evo.length >= 2 && (
              <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Évolution du chiffre d'affaires</div>
                <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>CA cumulé au fil des journées.</div>
                <div style={{ width: "100%", height: 230 }}>
                  <ResponsiveContainer>
                    <AreaChart data={evo} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                      <defs><linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.accent} stopOpacity={0.5} /><stop offset="1" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: T.faint, fontSize: 11 }} stroke={T.line} />
                      <YAxis tick={{ fill: T.faint, fontSize: 11 }} stroke={T.line} tickFormatter={(v) => eur0(v)} />
                      <Tooltip contentStyle={tooltip(T)} formatter={(v) => [eur(v), "CA cumulé"]} />
                      <Area type="monotone" dataKey="cumul" stroke={T.accent} strokeWidth={2.5} fill="url(#gCum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <SectionHead title="Détail par pratique" small />
            <div style={{ ...glass(T), padding: 14 }}>
              {agg.rows.map((r, idx) => { const pct = agg.acts ? (r.count / agg.acts) * 100 : 0; return (
                <div key={r.id} style={{ padding: "10px 6px", borderBottom: idx < agg.rows.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: CH[idx % CH.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: T.faint }}>{r.count}× · {pct.toFixed(0)}%</span>
                    <span style={{ fontWeight: 700, color: T.accent, minWidth: 82, textAlign: "right" }}>{eur(r.revenue)}</span>
                  </div>
                  {(r.avgMin != null || r.eurPerMin != null) && (
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.faint, paddingLeft: 20 }}>
                      {r.avgMin != null && <span><Clock size={11} style={{ verticalAlign: -1 }} /> ~{r.avgMin.toFixed(0)} min/acte</span>}
                      {r.eurPerMin != null && <span><TrendingUp size={11} style={{ verticalAlign: -1 }} /> {eur(r.eurPerMin)}/min</span>}
                    </div>
                  )}
                </div>); })}
            </div>
          </>}
    </div>
  );
}
function ScopeChip({ children, active, onClick, color }) {
  const T = useT();
  return <button onClick={onClick} className="lift" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `1px solid ${active ? color : T.line}`, background: active ? color + "22" : "transparent", color: active ? T.text : T.sub }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />{children}
  </button>;
}

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsView({ themeId, setThemeId, cabinets, setCabinets, journees, cabinetOf, priceOf, nameOf, revenue, netOf, profilePin, onChangePin, exportData, importData }) {
  const T = useT();
  const confirm = useConfirm();
  const fileRef = useRef(null);
  const [pinStep, setPinStep] = useState(null);
  const [pinBuf, setPinBuf] = useState(""); const [newPinBuf, setNewPinBuf] = useState(""); const [pinErr, setPinErr] = useState("");
  const [reportCab, setReportCab] = useState("");
  const [showTuto, setShowTuto] = useState(false);

  const reportCtx = { journees, cabinets, cabinetOf, priceOf, nameOf, revenue, netOf };

  const updateCabinet = (id, patch) => setCabinets((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));
  const removeCabinet = async (id) => {
    const inUse = journees.some((j) => j.cabinetId === id);
    const msg = inUse ? "Ce cabinet est utilisé par des journées. Le retirer ? (les journées seront conservées mais sans cabinet)" : "Supprimer ce cabinet ?";
    if (!(await confirm(msg))) return;
    setCabinets((cs) => cs.filter((c) => c.id !== id));
  };

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dentocount-sauvegarde-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const doImport = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const data = JSON.parse(reader.result); const ok = importData(data); if (ok !== false) alert("Sauvegarde importée avec succès. Toutes tes données ont été restaurées."); }
      catch { alert("Fichier invalide ou illisible."); }
      finally { e.target.value = ""; }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fadeUp">
      <SectionHead title="Réglages" subtitle="Personnalise l'app et gère tes données." />

      <button onClick={() => setShowTuto(true)} className="lift" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderRadius: 13, background: T.bg2, border: `1px solid ${T.line}`, cursor: "pointer", marginBottom: 16, color: T.text, textAlign: "left" }}>
        <Sparkles size={17} color={T.accent} />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Revoir le tutoriel</span>
        <ChevronRight size={16} color={T.faint} />
      </button>
      {showTuto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ maxWidth: 440, width: "100%" }}>
            <WelcomeScreen onDone={() => setShowTuto(false)} />
          </div>
        </div>
      )}

      {/* THEMES */}
      <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}><Palette size={18} color={T.accent} /><b>Thème de couleur</b></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {Object.entries(THEMES).map(([id, th]) => {
            const active = id === themeId;
            return (
              <button key={id} onClick={() => setThemeId(id)} className="lift" style={{ padding: 13, borderRadius: 13, cursor: "pointer", textAlign: "left", border: `2px solid ${active ? th.accent : T.line}`, background: th.bg, color: th.text, position: "relative" }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
                  {[th.accent, th.violet, th.amber, th.sky].map((c, i) => <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c }} />)}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{th.label}</div>
                <div style={{ fontSize: 11, color: th.faint }}>{th.dark ? "Sombre" : "Clair"}</div>
                {active && <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: th.accent, display: "grid", placeItems: "center" }}><Check size={13} color={th.accentInk} /></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* CABINETS */}
      <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}><Building2 size={18} color={T.violet} /><b>Cabinets</b></div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Renomme, choisis la couleur et le taux de rétrocession de chaque cabinet.</div>
        {cabinets.length === 0 && <div style={{ color: T.faint, fontSize: 13.5 }}>Aucun cabinet pour l'instant. Ils se créent automatiquement quand tu ajoutes une journée.</div>}
        <div style={{ display: "grid", gap: 12 }}>
          {cabinets.map((c) => (
            <div key={c.id} style={{ padding: 13, borderRadius: 13, border: `1px solid ${T.line}`, background: T.bg2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color, flexShrink: 0 }} />
                <input value={c.name} onChange={(e) => updateCabinet(c.id, { name: e.target.value })} style={{ ...inputStyle(T), flex: 1 }} />
                <IconBtn danger title="Supprimer" onClick={() => removeCabinet(c.id)}><Trash2 size={15} /></IconBtn>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                {CABINET_COLORS.map((col) => (
                  <button key={col} onClick={() => updateCabinet(c.id, { color: col })} className="lift" style={{ width: 26, height: 26, borderRadius: 7, background: col, cursor: "pointer", border: c.color === col ? `2px solid ${T.text}` : "2px solid transparent" }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: T.sub, display: "flex", alignItems: "center", gap: 5 }}><Percent size={13} /> Rétrocession</span>
                <input type="range" min={0} max={90} value={Math.round(c.cut * 100)} onChange={(e) => updateCabinet(c.id, { cut: Number(e.target.value) / 100 })} style={{ flex: 1, accentColor: c.color }} />
                <span style={{ fontWeight: 700, color: c.color, minWidth: 44, textAlign: "right" }}>{Math.round(c.cut * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECURITY */}
      <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}><KeyRound size={18} color={T.amber} /><b>Code de sécurité</b></div>
        {pinStep === null ? (
          <GhostBtn onClick={() => { setPinStep("current"); setPinBuf(""); setNewPinBuf(""); setPinErr(""); }}><Lock size={15} /> Changer mon code à 4 chiffres</GhostBtn>
        ) : (
          <div style={{ maxWidth: 280 }}>
            <div style={{ textAlign: "center", marginBottom: 14, color: T.sub, fontSize: 14 }}>
              {pinStep === "current" ? "Code actuel" : pinStep === "new" ? "Nouveau code" : "Confirme le nouveau code"}
            </div>
            <PinPad value={pinStep === "confirm" ? newPinBuf : pinBuf} error={!!pinErr}
              onChange={(v) => { setPinErr(""); pinStep === "confirm" ? setNewPinBuf(v) : setPinBuf(v); }}
              onSubmit={(v) => {
                if (pinStep === "current") { if (v === profilePin) { setPinStep("new"); setPinBuf(""); } else { setPinErr("Code incorrect"); setTimeout(() => setPinBuf(""), 400); } }
                else if (pinStep === "new") { setPinBuf(v); setPinStep("confirm"); setNewPinBuf(""); }
                else { if (v === pinBuf) { onChangePin(v); setPinStep(null); alert("Code mis à jour."); } else { setPinErr("Les codes ne correspondent pas"); setTimeout(() => { setNewPinBuf(""); setPinBuf(""); setPinStep("new"); }, 500); } }
              }} />
            {pinErr && <ErrMsg>{pinErr}</ErrMsg>}
            <Center><TextLink onClick={() => setPinStep(null)}>Annuler</TextLink></Center>
          </div>
        )}
      </div>

      {/* SAUVEGARDE DE COMPTE */}
      <div style={{ ...glass(T), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}><Download size={18} color={T.sky} /><b>Sauvegarde de mon compte</b></div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 6 }}>Exporte un fichier de sauvegarde complet pour reprendre ton compte sur un autre appareil (iPhone, ordinateur…), puis importe-le là-bas. Utile aussi pour garder une copie de sécurité.</div>
        <div style={{ fontSize: 12, color: T.faint, marginBottom: 14, lineHeight: 1.5 }}>Le fichier contient tout : journées, patients, actes, cabinets, remplas et réglages. L'import fonctionne aussi depuis une sauvegarde d'une ancienne version — tu ne perds jamais rien.</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PrimaryBtn onClick={doExport}><Download size={15} /> Exporter ma sauvegarde</PrimaryBtn>
          <GhostBtn onClick={() => fileRef.current?.click()}><Upload size={15} /> Importer une sauvegarde</GhostBtn>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={doImport} style={{ display: "none" }} />
        </div>
      </div>

      {/* RAPPORTS PDF */}
      <div style={{ ...glass(T), padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}><FileText size={18} color={T.violet} /><b>Rapports & documents</b></div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>Génère des documents lisibles (PDF) à garder, imprimer ou envoyer. Sur iPhone : le bouton ouvre l'aperçu, puis Partager → Enregistrer en PDF.</div>

        <div style={{ display: "grid", gap: 10 }}>
          <ReportRow icon={ListChecks} color={T.accent} title="Historique complet"
            desc="Toutes les pratiques réalisées : quand, pour quel patient, quels actes, à quel prix."
            onClick={() => reportHistory(reportCtx)} />

          <ReportRow icon={Euro} color={T.amber} title="Relevé comptable"
            desc="Recettes par cabinet, rétrocessions et par type d'acte — prêt à transmettre à ton comptable."
            onClick={() => reportAccounting(reportCtx, "Toutes périodes")} />

          <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: T.sky + "22", display: "grid", placeItems: "center" }}><Share2 size={16} color={T.sky} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Rapport de transparence</div>
                <div style={{ fontSize: 12.5, color: T.sub }}>Pour la personne que tu remplaces : activité détaillée d'un cabinet.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <select value={reportCab} onChange={(e) => setReportCab(e.target.value)} style={{ ...inputStyle(T), flex: 1 }}>
                <option value="">Choisir un cabinet…</option>
                {cabinets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <PrimaryBtn disabled={!reportCab} onClick={() => reportTransparency(reportCtx, reportCab)}><FileText size={15} /> Générer</PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ icon: Icon, color, title, desc, onClick }) {
  const T = useT();
  return (
    <button onClick={onClick} className="rowh lift" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg2, cursor: "pointer", color: T.text, textAlign: "left", width: "100%" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: color + "22", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={color} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: T.sub }}>{desc}</div>
      </div>
      <FileText size={16} color={T.faint} />
    </button>
  );
}

/* ============================================================
   AI ASSISTANT
   ============================================================ */
function analyzeLocally(q, ctx) {
  const lower = q.toLowerCase();
  const eur0 = (n) => (n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  if (!ctx.nb_journees || !ctx.total_patients) return "Je n'ai pas encore de données à analyser. Ajoute d'abord quelques journées avec des patients !";
  const cabs = [...ctx.par_cabinet].sort((a, b) => b.ca - a.ca);
  const bestCab = cabs[0];
  const prat = ctx.detail_pratiques;
  if (/temps|minute|long|dur[eé]/.test(lower)) {
    const timed = prat.filter((p) => p.min_moyen != null).sort((a, b) => b.min_moyen - a.min_moyen);
    if (!timed.length) return "Je n'ai pas de durées enregistrées. Renseigne les minutes par patient pour analyser ton temps.";
    return `Ce qui te prend le plus de temps :\n${timed.slice(0, 5).map((p) => `• ${p.pratique} : ${p.min_moyen} min en moyenne`).join("\n")}`;
  }
  if (/rentab|euro.*min|par minute|efficac/.test(lower)) {
    const eff = prat.filter((p) => p.euro_par_min != null).sort((a, b) => b.euro_par_min - a.euro_par_min);
    if (!eff.length) return "Renseigne les minutes par patient pour que je calcule la rentabilité par minute de chaque pratique.";
    return `Tes pratiques les plus rentables par minute :\n${eff.slice(0, 5).map((p) => `• ${p.pratique} : ${p.euro_par_min} €/min`).join("\n")}`;
  }
  if (/cabinet|cab /.test(lower) || /rapporte le plus/.test(lower)) {
    if (!cabs.length) return "Aucun cabinet enregistré pour l'instant.";
    return `Classement de tes cabinets par CA brut :\n${cabs.map((c) => `• ${c.cabinet} : ${eur0(c.ca)} (${c.journees} journées)`).join("\n")}\n\n${bestCab.cabinet} est ton meilleur cabinet. Va voir le comparateur sur l'accueil pour la vision par heure travaillée.`;
  }
  if (/pratique|acte/.test(lower)) {
    return `Tes pratiques par CA :\n${prat.slice(0, 6).map((p) => `• ${p.pratique} : ${eur0(p.ca)} (${p.nb} actes)`).join("\n")}`;
  }
  return `Résumé de ton activité :\n• ${ctx.nb_journees} journées, ${ctx.total_patients} patients, ${ctx.total_actes} actes\n• CA brut : ${eur0(ctx.ca_brut)}${ctx.ca_par_heure ? ` (${eur0(ctx.ca_par_heure)}/h)` : ""}\n• Meilleur cabinet : ${bestCab ? `${bestCab.cabinet} (${eur0(bestCab.ca)})` : "—"}\n• Pratique n°1 : ${prat[0] ? `${prat[0].pratique} (${eur0(prat[0].ca)})` : "—"}\n\nDemande-moi le détail par temps, rentabilité, cabinet ou pratique !`;
}

function AIView({ journees, priceOf, nameOf, cabinetOf, revenue }) {
  const T = useT();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, loading]);

  const buildContext = useCallback(() => {
    const byPractice = {}; let brut = 0, patients = 0, acts = 0, hours = 0;
    const byCabinet = {};
    for (const j of journees) {
      hours += j.hours || 0;
      const cab = cabinetOf(j.cabinetId);
      const cname = cab?.name || "Sans cabinet";
      const cr = byCabinet[cname] || { ca: 0, journees: 0 };
      cr.ca += revenue(j); cr.journees++; byCabinet[cname] = cr;
      for (const pt of j.patients) {
        patients++; const nA = pt.acts.length || 1;
        for (const a of pt.acts) {
          acts++; const price = a.price ?? priceOf(a.practiceId); brut += price;
          const r = byPractice[a.practiceId] || { name: nameOf(a.practiceId), count: 0, revenue: 0, minutes: 0, timed: 0 };
          r.count++; r.revenue += price;
          if (pt.minutes) { r.minutes += pt.minutes / nA; r.timed++; }
          byPractice[a.practiceId] = r;
        }
      }
    }
    const rows = Object.values(byPractice).map((r) => ({ pratique: r.name, nb: r.count, ca: Math.round(r.revenue * 100) / 100, min_moyen: r.timed ? Math.round((r.minutes / r.timed) * 10) / 10 : null, euro_par_min: r.minutes ? Math.round((r.revenue / r.minutes) * 100) / 100 : null })).sort((a, b) => b.ca - a.ca);
    return { nb_journees: journees.length, total_patients: patients, total_actes: acts, total_heures: hours || null, ca_brut: Math.round(brut * 100) / 100, ca_par_heure: hours ? Math.round((brut / hours) * 100) / 100 : null, par_cabinet: Object.entries(byCabinet).map(([n, v]) => ({ cabinet: n, ca: Math.round(v.ca * 100) / 100, journees: v.journees })), detail_pratiques: rows };
  }, [journees, priceOf, nameOf, cabinetOf, revenue]);

  const suggestions = ["Qu'est-ce qui me prend le plus de temps ?", "Quelles pratiques sont les plus rentables par minute ?", "Quel cabinet me rapporte le plus ?", "Résume mon activité."];

  const send = async (text) => {
    const content = (text ?? input).trim(); if (!content || loading) return;
    const history = [...messages, { role: "user", content }];
    setMessages(history); setInput(""); setLoading(true);
    const ctx = buildContext();
    setTimeout(() => {
      const reply = analyzeLocally(content, ctx);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 350);
  };

  const hasData = journees.some((j) => j.patients.length);
  return (
    <div className="fadeUp">
      <SectionHead title="Assistant" subtitle="Pose des questions sur ton activité réelle." />
      <div style={{ ...glass(T), display: "flex", flexDirection: "column", height: 560, overflow: "hidden" }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 13 }}>
          {messages.length === 0 && (
            <div style={{ margin: "auto 0", textAlign: "center", color: T.sub }}>
              <div style={{ width: 54, height: 54, borderRadius: 15, background: T.accent + "1f", display: "grid", placeItems: "center", margin: "0 auto 14px", border: `1px solid ${T.line2}` }}><Sparkles size={25} color={T.accent} /></div>
              <div style={{ fontWeight: 600, color: T.text, marginBottom: 6 }}>Analyse ton activité</div>
              <div style={{ fontSize: 13, maxWidth: 360, margin: "0 auto 18px", lineHeight: 1.6 }}>{hasData ? "Demande ce qui te prend le plus de temps, ce qui rapporte le plus, quel cabinet est le plus rentable…" : "Ajoute d'abord des journées — l'assistant s'appuie sur tes données réelles."}</div>
              {hasData && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rowh lift" style={{ fontSize: 13, padding: "8px 12px", borderRadius: 10, background: T.bg2, border: `1px solid ${T.line}`, color: T.text, cursor: "pointer" }}>{s}</button>)}</div>}
            </div>
          )}
          {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.content} />)}
          {loading && <div style={{ display: "flex", gap: 8, alignItems: "center", color: T.accent, fontSize: 14 }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyse en cours…</div>}
        </div>
        <div style={{ borderTop: `1px solid ${T.line}`, padding: 12, display: "flex", gap: 10 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={hasData ? "Pose ta question…" : "Ajoute des données d'abord…"} disabled={!hasData || loading} style={{ ...inputStyle(T), flex: 1, opacity: hasData ? 1 : 0.5 }} />
          <PrimaryBtn onClick={() => send()} disabled={!hasData || loading || !input.trim()}><Send size={16} /></PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
function Bubble({ role, text }) {
  const T = useT();
  const me = role === "user";
  return <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start" }} className="fadeUp">
    <div style={{ maxWidth: "82%", padding: "11px 14px", borderRadius: 14, fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", background: me ? T.accent : T.bg2, color: me ? T.accentInk : T.text, border: me ? "none" : `1px solid ${T.line}`, borderBottomRightRadius: me ? 4 : 14, borderBottomLeftRadius: me ? 14 : 4, fontWeight: me ? 500 : 400 }}>{text}</div>
  </div>;
}

/* ============================================================
   REPORTS (HTML -> impression navigateur -> PDF)
   Marche sur ordinateur et iPhone (Partager/Imprimer -> Enregistrer en PDF)
   ============================================================ */
const money = (n) => (n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const longDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function openPrintable(title, bodyHtml) {
  const win = window.open("", "_blank");
  if (!win) { alert("Autorise les fenêtres pop-up pour générer le PDF, ou réessaie."); return; }
  const css = `
    * { box-sizing: border-box; }
    body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1a2233; margin: 0; padding: 32px; font-size: 12px; }
    h1 { font-size: 22px; margin: 0 0 2px; }
    h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 5px; border-bottom: 2px solid #12B886; color: #0f5c47; }
    .sub { color: #667; font-size: 12px; margin-bottom: 4px; }
    .kpis { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0; }
    .kpi { flex: 1; min-width: 120px; border: 1px solid #dde3ec; border-radius: 10px; padding: 12px; }
    .kpi .l { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #889; }
    .kpi .v { font-size: 19px; font-weight: 700; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 4px; }
    th, td { text-align: left; padding: 7px 9px; border-bottom: 1px solid #e6ebf2; }
    th { background: #f4f7fb; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #667; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    .cab { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
    .tot { font-weight: 700; background: #f4f7fb; }
    .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e6ebf2; color: #99a; font-size: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .logo { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg,#5BF0B8,#12B886); }
    @media print { body { padding: 0; } @page { margin: 16mm; } }
  `;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>
    <div class="brand"><div class="logo"></div><div><h1>${title}</h1><div class="sub">Généré par Dentocount · ${new Date().toLocaleDateString("fr-FR")}</div></div></div>
    ${bodyHtml}
    <div class="foot">Document généré automatiquement par Dentocount. Les montants correspondent aux actes saisis par l'utilisateur. Ce document est un relevé d'activité et ne constitue pas une déclaration fiscale officielle.</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 350);
}

// données agrégées communes
function collectReport({ journees, cabinets, cabinetOf, priceOf, nameOf, revenue, netOf }, filterFn) {
  const js = (filterFn ? journees.filter(filterFn) : journees).slice().sort((a, b) => a.date < b.date ? -1 : 1);
  let brut = 0, net = 0, patients = 0, acts = 0;
  const byCab = {}; const byPractice = {};
  for (const j of js) {
    const r = revenue(j), n = netOf(j); brut += r; net += n;
    const cab = cabinetOf(j.cabinetId); const cid = cab?.id || "none";
    const cr = byCab[cid] || { name: cab?.name || "Sans cabinet", color: cab?.color || "#999", cut: cab?.cut ?? 0.30, brut: 0, net: 0, journees: 0, patients: 0 };
    cr.brut += r; cr.net += n; cr.journees++; cr.patients += j.patients.length; byCab[cid] = cr;
    for (const pt of j.patients) {
      patients++;
      for (const a of pt.acts) { acts++; const price = a.price ?? priceOf(a.practiceId); const pr = byPractice[a.practiceId] || { name: nameOf(a.practiceId), count: 0, revenue: 0 }; pr.count++; pr.revenue += price; byPractice[a.practiceId] = pr; }
    }
  }
  return { js, brut, net, patients, acts, byCab: Object.values(byCab).sort((a, b) => b.brut - a.brut), byPractice: Object.values(byPractice).sort((a, b) => b.revenue - a.revenue) };
}

// 1) Historique complet, lisible : chaque acte, quand, pour qui, à quel prix
function reportHistory(ctx) {
  const { js } = collectReport(ctx);
  let rows = "";
  for (const j of js) {
    const cab = ctx.cabinetOf(j.cabinetId);
    if (!j.patients.length) continue;
    let first = true;
    for (const pt of j.patients) {
      const ptTotal = pt.acts.reduce((s, a) => s + (a.price ?? ctx.priceOf(a.practiceId)), 0);
      const actsList = pt.acts.map((a) => ctx.nameOf(a.practiceId)).join(", ") || "—";
      rows += `<tr>
        <td>${first ? longDate(j.date) : ""}</td>
        <td>${first ? `<span class="cab" style="background:${cab?.color || "#999"}"></span>${cab?.name || "—"}` : ""}</td>
        <td>${pt.name || "—"}${pt.minutes ? ` <span style="color:#99a">(${pt.minutes} min)</span>` : ""}</td>
        <td>${actsList}</td>
        <td class="num">${money(ptTotal)}</td>
      </tr>`;
      first = false;
    }
  }
  const { brut, net, patients, acts } = collectReport(ctx);
  const body = `
    <div class="kpis">
      <div class="kpi"><div class="l">CA brut total</div><div class="v">${money(brut)}</div></div>
      <div class="kpi"><div class="l">CA net total</div><div class="v">${money(net)}</div></div>
      <div class="kpi"><div class="l">Patients</div><div class="v">${patients}</div></div>
      <div class="kpi"><div class="l">Actes</div><div class="v">${acts}</div></div>
    </div>
    <h2>Historique détaillé</h2>
    <table><thead><tr><th>Date</th><th>Cabinet</th><th>Patient</th><th>Actes réalisés</th><th class="num">Montant</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5" style="color:#99a">Aucun acte enregistré.</td></tr>`}</tbody></table>`;
  openPrintable("Historique d'activité", body);
}

// 2) Rapport comptable (façon relevé pour expert-comptable / Indy)
function reportAccounting(ctx, periodLabel) {
  const { brut, net, patients, acts, byCab, byPractice } = collectReport(ctx);
  const retro = brut - net;
  const cabRows = byCab.map((c) => `<tr>
      <td><span class="cab" style="background:${c.color}"></span>${c.name}</td>
      <td class="num">${c.journees}</td>
      <td class="num">${money(c.brut)}</td>
      <td class="num">${Math.round(c.cut * 100)}%</td>
      <td class="num">${money(c.brut - c.net)}</td>
      <td class="num">${money(c.net)}</td>
    </tr>`).join("");
  const practiceRows = byPractice.map((p) => `<tr><td>${p.name}</td><td class="num">${p.count}</td><td class="num">${money(p.revenue)}</td></tr>`).join("");
  const body = `
    <div class="sub">${periodLabel || "Toutes périodes"}</div>
    <div class="kpis">
      <div class="kpi"><div class="l">Recettes brutes</div><div class="v">${money(brut)}</div></div>
      <div class="kpi"><div class="l">Rétrocessions</div><div class="v">${money(retro)}</div></div>
      <div class="kpi"><div class="l">Recettes nettes</div><div class="v">${money(net)}</div></div>
    </div>
    <h2>Recettes par cabinet</h2>
    <table><thead><tr><th>Cabinet</th><th class="num">Journées</th><th class="num">Brut</th><th class="num">Rétro.</th><th class="num">Montant rétro.</th><th class="num">Net</th></tr></thead>
    <tbody>${cabRows || `<tr><td colspan="6" style="color:#99a">—</td></tr>`}
    <tr class="tot"><td>TOTAL</td><td class="num"></td><td class="num">${money(brut)}</td><td class="num"></td><td class="num">${money(retro)}</td><td class="num">${money(net)}</td></tr>
    </tbody></table>
    <h2>Détail par type d'acte</h2>
    <table><thead><tr><th>Acte</th><th class="num">Nombre</th><th class="num">Recettes</th></tr></thead>
    <tbody>${practiceRows || `<tr><td colspan="3" style="color:#99a">—</td></tr>`}
    <tr class="tot"><td>TOTAL</td><td class="num">${acts}</td><td class="num">${money(brut)}</td></tr></tbody></table>`;
  openPrintable("Relevé comptable", body);
}

// 3) Rapport de transparence pour la personne remplacée (un cabinet)
function reportTransparency(ctx, cabinetId) {
  const cab = ctx.cabinetOf(cabinetId);
  const sub = collectReport(ctx, (j) => j.cabinetId === cabinetId);
  let rows = "";
  for (const j of sub.js) {
    if (!j.patients.length) continue;
    const ordered = j.patients.map((p, i) => ({ ...p, idx: i + 1 }));
    let first = true;
    for (const pt of ordered) {
      const total = pt.acts.reduce((s, a) => s + (a.price ?? ctx.priceOf(a.practiceId)), 0);
      rows += `<tr>
        <td>${first ? longDate(j.date) : ""}</td>
        <td class="num">${pt.idx}</td>
        <td>${pt.name || "—"}</td>
        <td class="num">${pt.minutes ? pt.minutes + " min" : "—"}</td>
        <td>${pt.acts.map((a) => ctx.nameOf(a.practiceId)).join(", ") || "—"}</td>
        <td class="num">${money(total)}</td>
      </tr>`;
      first = false;
    }
  }
  const body = `
    <div class="sub">Cabinet : <b>${cab?.name || "—"}</b></div>
    <p style="color:#556;font-size:12px;line-height:1.5;margin:10px 0 4px">Ce document récapitule, en toute transparence, l'activité réalisée lors du remplacement : les patients vus (dans l'ordre), le temps passé, les actes effectués et les montants correspondants.</p>
    <div class="kpis">
      <div class="kpi"><div class="l">Journées</div><div class="v">${sub.byCab[0]?.journees || 0}</div></div>
      <div class="kpi"><div class="l">Patients</div><div class="v">${sub.patients}</div></div>
      <div class="kpi"><div class="l">Actes</div><div class="v">${sub.acts}</div></div>
      <div class="kpi"><div class="l">CA généré</div><div class="v">${money(sub.brut)}</div></div>
    </div>
    <h2>Détail chronologique</h2>
    <table><thead><tr><th>Date</th><th class="num">Ordre</th><th>Patient</th><th class="num">Durée</th><th>Actes</th><th class="num">Montant</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="color:#99a">Aucun acte pour ce cabinet.</td></tr>`}</tbody></table>`;
  openPrintable(`Transparence — ${cab?.name || "Cabinet"}`, body);
}

/* ============================================================
   PRIMITIVES
   ============================================================ */
const inputStyle = (T) => ({ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1px solid ${T.line}`, background: T.bg2, color: T.text, fontSize: 14 });
const glass = (T) => ({ background: T.card, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.line}`, borderRadius: 18 });
const tooltip = (T) => ({ background: T.cardSolid, border: `1px solid ${T.line2}`, borderRadius: 10, color: T.text, fontSize: 13 });

function Field({ label, children }) { const T = useT(); return <label style={{ display: "block" }}><div style={{ fontSize: 12, color: T.faint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>{children}</label>; }
function PrimaryBtn({ children, onClick, disabled, full }) { const T = useT(); return <button onClick={onClick} disabled={disabled} className="lift" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 11, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, background: disabled ? T.accent + "40" : T.accent, color: T.accentInk, opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap", width: full ? "100%" : "auto" }}>{children}</button>; }
function GhostBtn({ children, onClick }) { const T = useT(); return <button onClick={onClick} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 11, border: `1px solid ${T.line2}`, cursor: "pointer", fontWeight: 600, fontSize: 14, background: "transparent", color: T.sub, whiteSpace: "nowrap" }}>{children}</button>; }
function TextLink({ children, onClick }) { const T = useT(); return <button onClick={onClick} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: 13.5 }}>{children}</button>; }
function IconBtn({ children, onClick, title, danger }) { const T = useT(); return <button onClick={onClick} title={title} className="lift" style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, border: `1px solid ${T.line}`, cursor: "pointer", background: "transparent", color: danger ? T.rose : T.sub }}>{children}</button>; }
function SectionHead({ title, subtitle, action, small }) { const T = useT(); return <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 15, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 180 }}><h2 style={{ margin: 0, fontSize: small ? 17 : 20, fontWeight: 700, letterSpacing: -0.2 }}>{title}</h2>{subtitle && <div style={{ color: T.sub, fontSize: 13.5, marginTop: 3 }}>{subtitle}</div>}</div>{action}</div>; }
function Stat({ label, value, color, mini }) { const T = useT(); return <div style={{ textAlign: mini ? "left" : "center" }}><div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div><div style={{ fontWeight: 700, fontSize: mini ? 18 : 22, color: color || T.text }}>{value}</div></div>; }
function BigStat({ icon: Icon, label, value, color }) { const T = useT(); return <div style={{ ...glass(T), padding: 15 }}><div style={{ width: 30, height: 30, borderRadius: 9, background: color + "22", display: "grid", placeItems: "center", marginBottom: 10 }}><Icon size={16} color={color} /></div><div style={{ fontSize: 11.5, color: T.faint, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div><div style={{ fontWeight: 700, fontSize: 22, color, marginTop: 2 }}>{value}</div></div>; }
function Empty({ icon: Icon, title, text }) { const T = useT(); return <div style={{ ...glass(T), padding: "42px 20px", textAlign: "center" }} className="fadeUp"><div style={{ width: 50, height: 50, borderRadius: 14, background: T.bg2, display: "grid", placeItems: "center", margin: "0 auto 13px", border: `1px solid ${T.line}` }}><Icon size={23} color={T.faint} /></div><div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div><div style={{ color: T.sub, fontSize: 14, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>{text}</div></div>; }
