import Link from "next/link";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { AuthButton } from "@/components/AuthButton";
import { KnightMark } from "@/components/oc";
import { Button } from "@/components/ui/button";
import {
  Check,
  Plus,
  Share2,
  Trophy,
  Users,
  Shield,
  Globe,
  GitBranch,
  Zap,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";

// ── Chess board graphic with floating code card ──────────────────────────────
function BoardGraphic() {
  const pieces: Record<string, string> = {
    "0,0": "♜", "0,4": "♚", "0,6": "♞",
    "1,1": "♟", "1,3": "♟", "1,5": "♟", "1,6": "♟",
    "2,2": "♟", "3,4": "♟",
    "4,3": "♙", "4,4": "♙",
    "5,2": "♘",
    "6,0": "♙", "6,1": "♙", "6,5": "♙", "6,6": "♙", "6,7": "♙",
    "7,2": "♖", "7,4": "♔", "7,6": "♗",
  };
  const BLACK = new Set(["♜", "♞", "♝", "♛", "♚", "♟"]);

  const cells = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1;
      const p = pieces[`${r},${c}`];
      const isBlack = p ? BLACK.has(p) : false;
      cells.push(
        <div
          key={`${r},${c}`}
          style={{
            background: dark ? "var(--board-dark)" : "var(--board-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, lineHeight: 1,
            color: isBlack ? "#1c1c1a" : "#fbfbf8",
            textShadow: isBlack ? "none" : "0 1px 1px rgba(0,0,0,.30)",
          }}
        >
          {p ?? ""}
        </div>
      );
    }
  }

  return (
    <div style={{ position: "relative", paddingBottom: 38, paddingRight: 26 }}>
      {/* depth plate */}
      <div style={{
        position: "absolute", top: 16, left: 16, right: 10, bottom: 54,
        background: "var(--board-edge)", borderRadius: "var(--radius-lg)", opacity: 0.22,
      }} />
      {/* board */}
      <div style={{
        position: "relative",
        display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)",
        width: "100%", aspectRatio: "1", borderRadius: "var(--radius-lg)", overflow: "hidden",
        border: "6px solid #2c3a22",
        boxShadow: "var(--shadow-lg)",
      }}>
        {cells}
      </div>
      {/* floating code card */}
      <div style={{
        position: "absolute", right: 0, bottom: 0, width: 220,
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-lg)",
        padding: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--brand)", display: "inline-block", flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--font-space-mono, monospace)",
            fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)",
          }}>Live now</span>
        </div>
        <div style={{
          fontFamily: "var(--font-space-grotesk, sans-serif)",
          fontWeight: 700, fontSize: 15, color: "var(--ink-900)", marginBottom: 2,
        }}>Friday Night Blitz</div>
        <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 12 }}>32 players · Round 3 of 7</div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 11px", background: "var(--surface-sunk)", borderRadius: "var(--radius-md)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-400)",
          }}>CODE</span>
          <span style={{
            fontFamily: "var(--font-space-mono, monospace)", fontWeight: 700,
            fontSize: 17, letterSpacing: "var(--ls-code)", color: "var(--ink-900)",
          }}>QF7 K2P</span>
        </div>
      </div>
    </div>
  );
}

// ── Shared section eyebrow + heading ────────────────────────────────────────
function SectionHead({
  eyebrow, title, sub,
}: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="oc-section-head" style={{ maxWidth: 640 }}>
      <div style={{
        fontFamily: "var(--font-space-mono, monospace)",
        fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
        color: "#0A5A35", marginBottom: 14,
      }}>{eyebrow}</div>
      <h2 className="oc-section-h2 font-display font-bold tracking-[-0.03em] text-ink-900 m-0">
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 17, color: "#3A3E45", margin: "16px 0 0", lineHeight: 1.55 }}>{sub}</p>
      )}
    </div>
  );
}

// ── Icon tiles ───────────────────────────────────────────────────────────────
function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      width: 44, height: 44, borderRadius: 10, background: "#EAF6EE", color: "#0E7343",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>{children}</span>
  );
}

function BorderIconTile({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      flexShrink: 0, width: 42, height: 42, borderRadius: 10,
      border: "1px solid #E7E7E2", background: "#FFFFFF", color: "#0E7343",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink-900 font-sans">

      {/* ━━━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="oc-header">
        <div className="oc-container oc-header-inner">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 no-underline text-ink-900 hover:text-ink-900"
          >
            <KnightMark size={26} />
            <span className="oc-brand-wordmark font-display text-xl font-bold tracking-[-0.03em]">
              openchess<span className="text-ink-400">.dev</span>
            </span>
          </Link>

          <nav className="oc-nav flex gap-6 ml-3">
            {[
              ["How it works", "#how"],
              ["Formats", "#formats"],
              ["Why openchess", "#why"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[14.5px] font-medium text-ink-700 no-underline py-1.5 hover:text-ink-900"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="oc-header-actions">
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              <LayoutDashboard className="size-4" />
              <span className="oc-dash-label">Mis torneos</span>
            </Button>
            <AuthButton />
            <CreateTournamentDialog
              triggerLabel="Crear torneo"
              triggerSize="sm"
              triggerClassName="oc-header-create"
            />
          </div>
        </div>
      </header>

      {/* ━━━━ Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* board-square texture, top-right */}
        <div aria-hidden style={{
          position: "absolute", top: -40, right: -40, width: 380, height: 380, opacity: 0.45,
          backgroundImage:
            "linear-gradient(45deg,#F4F4EF 25%,transparent 25%,transparent 75%,#F4F4EF 75%)," +
            "linear-gradient(45deg,#F4F4EF 25%,transparent 25%,transparent 75%,#F4F4EF 75%)",
          backgroundSize: "44px 44px", backgroundPosition: "0 0,22px 22px",
          maskImage: "radial-gradient(circle at top right,black,transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at top right,black,transparent 70%)",
        }} />

        <div
          className="oc-container oc-hero-pad oc-hero-grid grid items-center gap-[72px]"
          style={{ gridTemplateColumns: "1.05fr 0.95fr" }}
        >
          {/* Left column */}
          <div>
            {/* Eyebrow pill */}
            <div className="oc-eyebrow-pill inline-flex items-center gap-2 mb-5 px-2.5 py-1.5 border border-line rounded-full bg-surface max-w-full">
              <GitBranch size={14} color="#0E7343" />
              <span style={{
                fontFamily: "var(--font-space-mono, monospace)",
                fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7079",
              }}>Open-source tournament platform</span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-space-grotesk, sans-serif)",
              fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 700,
              lineHeight: 1.02, letterSpacing: "-0.035em", color: "#15171A", margin: 0,
            }}>
              Corre un torneo<br />
              de ajedrez en<br />
              <span style={{ color: "#0E7343" }}>dos clicks.</span>
            </h1>

            <p className="oc-hero-sub" style={{
              fontSize: 18, lineHeight: 1.55, color: "#3A3E45",
              margin: "22px 0 34px", maxWidth: 440,
            }}>
              Crea emparejamientos suizos, eliminatorias o formato arena en segundos.
              Los jugadores entran desde cualquier dispositivo con un código de seis
              caracteres — sin cuentas, sin fricción.
            </p>

            <div className="oc-hero-cta">
              <CreateTournamentDialog
                triggerLabel="Crear torneo"
                triggerSize="lg"
              />
              <Button variant="secondary" size="lg" render={<Link href="/join" />}>
                <Share2 size={19} />
                Unirse a un torneo
              </Button>
            </div>

            <div className="oc-hero-reassurance">
              <Check size={16} color="#0E7343" />
              Gratis para clubes &amp; escuelas · Self-host o en la nube
            </div>
          </div>

          {/* Right column: board */}
          <div className="oc-board-col" style={{ paddingRight: 8 }}>
            <BoardGraphic />
          </div>
        </div>
      </section>

      {/* ━━━━ How it works ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how" style={{ background: "#FBFBF8", borderTop: "1px solid #E7E7E2" }}>
        <div className="oc-container oc-section-pad">
          <SectionHead
            eyebrow="How it works"
            title="Tres pasos de la idea al cuadro."
          />
          <div
            className="oc-grid-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}
          >
            {([
              {
                n: "01", Icon: Plus, t: "Crea",
                d: "Elige el formato, configura rondas y control de tiempo, y ya estás en vivo. Los valores predeterminados te permiten ir directo al juego.",
              },
              {
                n: "02", Icon: Share2, t: "Comparte el código",
                d: "Cada torneo tiene un código corto. Echalo en un chat grupal o proyéctalo en la pared — los jugadores solo lo escriben.",
              },
              {
                n: "03", Icon: Trophy, t: "Juega",
                d: "Emparejamientos, resultados y clasificaciones en vivo se actualizan ronda a ronda. Desempates y byes manejados automáticamente.",
              },
            ] as const).map((s) => (
              <div key={s.n} className="oc-feature-card" style={{
                background: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: 14,
                padding: 28, boxShadow: "0 1px 3px rgba(21,23,26,.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <IconTile><s.Icon size={22} /></IconTile>
                  <span style={{
                    fontFamily: "var(--font-space-mono, monospace)",
                    fontSize: 13, color: "#C9CBD0", fontWeight: 700,
                  }}>{s.n}</span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-space-grotesk, sans-serif)",
                  fontSize: 21, fontWeight: 700, color: "#15171A", margin: "0 0 8px",
                }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, color: "#3A3E45", margin: 0, lineHeight: 1.55 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ Formats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="formats" style={{ borderTop: "1px solid #E7E7E2", background: "#FFFFFF" }}>
        <div className="oc-container oc-section-pad">
          <SectionHead
            eyebrow="Formats"
            title="Todos los formatos que un torneo necesita."
            sub="Desde una noche de club con cuatro jugadores hasta un Suizo abierto de 256 — openchess gestiona emparejamientos, desempates y byes según las convenciones FIDE."
          />
          <div
            className="oc-grid-4"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}
          >
            {([
              { Icon: Users,      t: "Suizo",       d: "Todos juegan cada ronda. Ideal para campos abiertos grandes.",    tag: "POPULAR" },
              { Icon: Trophy,     t: "Eliminación", d: "Brackets de eliminación simple o doble.",                         tag: null      },
              { Icon: LayoutGrid, t: "Round Robin", d: "Todos contra todos. Ideal para secciones pequeñas.",              tag: null      },
              { Icon: Zap,        t: "Arena",        d: "Emparejamiento continuo contra el reloj.",                       tag: "BLITZ"   },
            ] as const).map((f) => (
              <div key={f.t} className="oc-feature-card" style={{
                border: "1px solid #E7E7E2", borderRadius: 14, padding: 24, background: "#FBFBF8",
              }}>
                <span style={{ color: "#15171A", display: "flex", marginBottom: 18 }}>
                  <f.Icon size={24} />
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <h3 style={{
                    fontFamily: "var(--font-space-grotesk, sans-serif)",
                    fontSize: 18, fontWeight: 700, color: "#15171A", margin: 0,
                  }}>{f.t}</h3>
                  {f.tag && (
                    <span style={{
                      fontFamily: "var(--font-space-mono, monospace)",
                      fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em",
                      textTransform: "uppercase", color: "#0E7343",
                      background: "#EAF6EE", border: "1px solid #A3D8B6",
                      padding: "2px 7px", borderRadius: 4,
                    }}>{f.tag}</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: "#3A3E45", margin: 0, lineHeight: 1.5 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ Why ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="why" style={{ borderTop: "1px solid #E7E7E2", background: "#FBFBF8" }}>
        <div className="oc-container oc-section-pad">
          <SectionHead
            eyebrow="Why openchess"
            title="Construido para organizadores que se lo toman en serio."
          />
          <div
            className="oc-grid-2"
            style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 28 }}
          >
            {([
              { Icon: Trophy,  t: "Clasificaciones en tiempo real", d: "Los emparejamientos y las tablas de resultados se actualizan en el instante en que se reporta un resultado." },
              { Icon: Shield,  t: "Justo por defecto",              d: "Desempates automáticos (Buchholz, Sonneborn–Berger), manejo de byes y balance de colores." },
              { Icon: Globe,   t: "Únete desde cualquier lugar",    d: "Un código es todo lo que necesita un jugador. Funciona en teléfonos, laptops y el proyector del club." },
              { Icon: GitBranch,  t: "Abierto y auto-hosteable",       d: "Núcleo con licencia MIT. Córrelo en nuestra nube o en tu propio servidor — tus datos, tus reglas." },
            ] as const).map((f) => (
              <div key={f.t} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <BorderIconTile><f.Icon size={20} /></BorderIconTile>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-space-grotesk, sans-serif)",
                    fontSize: 18, fontWeight: 700, color: "#15171A", margin: "2px 0 6px",
                  }}>{f.t}</h3>
                  <p style={{ fontSize: 14.5, color: "#3A3E45", margin: 0, lineHeight: 1.55 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ CTA band ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: "#15171A", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0, opacity: .06,
          backgroundImage:
            "linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%)," +
            "linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%)",
          backgroundSize: "60px 60px", backgroundPosition: "0 0,30px 30px",
        }} />
        <div className="oc-container oc-cta-pad relative text-center">
          <h2 className="oc-cta-title font-display font-bold tracking-[-0.035em] text-white mx-auto mb-4 max-w-[620px]">
            Tu próximo torneo está a un código de distancia.
          </h2>
          <p style={{ fontSize: 17, color: "#C9CBD0", margin: "0 auto 32px", maxWidth: 480 }}>
            Configúralo antes de que empiece la primera ronda. En serio.
          </p>
          <div className="oc-cta-actions flex gap-3 justify-center flex-wrap">
            <CreateTournamentDialog triggerLabel="Crear torneo" triggerSize="lg" />
            <Button
              variant="ghost"
              size="lg"
              className="oc-join-btn-dark text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:text-white"
              render={<Link href="/join" />}
            >
              Unirse con un código
            </Button>
          </div>
        </div>
      </section>

      {/* ━━━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ background: "#FBFBF8", borderTop: "1px solid #E7E7E2" }}>
        <div
          className="oc-container oc-footer-grid pt-14 pb-10 grid gap-8"
          style={{ gridTemplateColumns: "1.4fr repeat(4, 1fr)" }}
        >
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 14 }}>
              <KnightMark size={24} />
              <span style={{
                fontFamily: "var(--font-space-grotesk, sans-serif)",
                fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "#15171A",
              }}>
                openchess<span style={{ color: "#9A9EA6" }}>.dev</span>
              </span>
            </Link>
            <p style={{ fontSize: 13.5, color: "#6B7079", maxWidth: 240, lineHeight: 1.55, margin: 0 }}>
              Torneos de ajedrez open-source. Crea uno, comparte el código, juega.
            </p>
          </div>
          {([
            { h: "Producto",       links: ["Formatos", "Precios", "Changelog", "Status"] },
            { h: "Organizadores",  links: ["Correr un evento", "Guía emparejamientos", "Desempates", "Importar ratings"] },
            { h: "Developers",     links: ["Docs", "API", "Self-hosting", "GitHub"] },
            { h: "Empresa",        links: ["Acerca de", "Comunidad", "Privacidad", "Términos"] },
          ] as const).map((col) => (
            <div key={col.h}>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
                color: "#15171A", marginBottom: 8,
              }}>{col.h}</div>
              {col.links.map((l) => (
                <a key={l} href="#" style={{
                  display: "block", fontSize: 14, color: "#6B7079",
                  textDecoration: "none", lineHeight: 2.1,
                }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="oc-container oc-footer-bar">
          <span style={{
            fontFamily: "var(--font-space-mono, monospace)", fontSize: 12, color: "#9A9EA6",
          }}>© 2026 openchess.dev — MIT</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-400">
            <KnightMark size={14} className="text-ink-400" />
            Made for the board.
          </span>
        </div>
      </footer>

    </div>
  );
}
