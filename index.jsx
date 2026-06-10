import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
// Palette: void-black bg | electric-mint primary | violet secondary | amber Riyadh
// Type: Space Grotesk display + Inter body + JetBrains Mono labels
// Injecting Google Fonts via style tag

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --void: #0A0A0F;
      --surface: #12121C;
      --surface-2: #1A1A2E;
      --mint: #00FFB2;
      --mint-dim: #00FFB220;
      --violet: #7B61FF;
      --violet-dim: #7B61FF20;
      --amber: #FF6B35;
      --amber-dim: #FF6B3520;
      --text: #E8E8F0;
      --text-muted: #7A7A9A;
      --border: #ffffff0d;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--void);
      color: var(--text);
      font-family: 'Geist', sans-serif;
      overflow-x: hidden;
      line-height: 1.6;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--mint); border-radius: 2px; }

    .display { font-family: 'Geist', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .mint { color: var(--mint); }
    .violet { color: var(--violet); }
    .amber { color: var(--amber); }

    .glow-mint { text-shadow: 0 0 30px #00FFB260; }
    .glow-violet { text-shadow: 0 0 30px #7B61FF60; }

    /* Noise overlay for texture */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }

    section { position: relative; }

    .section-pad { padding: 7rem 0; }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--mint);
    }

    .card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 16px;
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      border-color: #00FFB230;
      transform: translateY(-4px);
      box-shadow: 0 20px 60px #00FFB210;
    }

    /* Nav */
    nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      padding: 1.2rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0A0A0F99;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }

    nav a {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      color: var(--text-muted);
      text-decoration: none;
      letter-spacing: 0.1em;
      transition: color 0.2s;
    }
    nav a:hover { color: var(--mint); }

    /* Hero workflow SVG */
    .flow-node {
      animation: pulse-node 3s ease-in-out infinite;
    }
    @keyframes pulse-node {
      0%, 100% { opacity: 0.6; r: 6; }
      50% { opacity: 1; r: 8; }
    }
    .flow-line {
      stroke-dasharray: 6 4;
      animation: dash-flow 2s linear infinite;
    }
    @keyframes dash-flow {
      to { stroke-dashoffset: -20; }
    }

    /* Timeline */
    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0; bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, transparent, var(--amber) 20%, var(--amber) 80%, transparent);
      transform: translateX(-50%);
    }

    /* Skill bubbles */
    .skill-bubble {
      border-radius: 9999px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      padding: 0.6rem 1.4rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      color: var(--text-muted);
      transition: all 0.25s;
      cursor: default;
      white-space: nowrap;
    }
    .skill-bubble:hover {
      background: var(--mint-dim);
      border-color: var(--mint);
      color: var(--mint);
      transform: scale(1.06);
      box-shadow: 0 0 20px #00FFB220;
    }
    .skill-bubble.violet:hover {
      background: var(--violet-dim);
      border-color: var(--violet);
      color: var(--violet);
      box-shadow: 0 0 20px #7B61FF20;
    }

    /* Cursor glow */
    .cursor-glow {
      position: fixed;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, #00FFB208 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
    }

    @media (max-width: 768px) {
      nav .nav-links { display: none; }
      .section-pad { padding: 5rem 0; }
    }
  `}</style>
);

// ─── WORKFLOW SVG (Hero signature element) ─────────────────────────
const WorkflowSVG = () => (
  <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520, opacity: 0.7 }}>
    {/* Flow lines */}
    <line x1="60" y1="100" x2="140" y2="100" stroke="#00FFB2" strokeWidth="1.5" className="flow-line" />
    <line x1="200" y1="100" x2="270" y2="60" stroke="#7B61FF" strokeWidth="1.5" className="flow-line" />
    <line x1="200" y1="100" x2="270" y2="140" stroke="#7B61FF" strokeWidth="1.5" className="flow-line" />
    <line x1="320" y1="60" x2="390" y2="100" stroke="#00FFB2" strokeWidth="1.5" className="flow-line" />
    <line x1="320" y1="140" x2="390" y2="100" stroke="#00FFB2" strokeWidth="1.5" className="flow-line" />
    <line x1="440" y1="100" x2="500" y2="100" stroke="#FF6B35" strokeWidth="1.5" className="flow-line" />

    {/* Nodes */}
    {[
      { cx: 50, cy: 100, fill: "#00FFB2", label: "START" },
      { cx: 170, cy: 100, fill: "#00FFB2", label: "INTAKE" },
      { cx: 295, cy: 60, fill: "#7B61FF", label: "ROUTE" },
      { cx: 295, cy: 140, fill: "#7B61FF", label: "REVIEW" },
      { cx: 415, cy: 100, fill: "#00FFB2", label: "APPROVE" },
      { cx: 510, cy: 100, fill: "#FF6B35", label: "DEPLOY" },
    ].map(({ cx, cy, fill, label }, i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={14} fill={fill + "18"} stroke={fill} strokeWidth="1.5"
          style={{ animation: `pulse-node ${2.5 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }} />
        <circle cx={cx} cy={cy} r={5} fill={fill} />
        <text x={cx} y={cy + 26} textAnchor="middle"
          style={{ fontFamily: "JetBrains Mono", fontSize: 8, fill: fill + "99", letterSpacing: "0.1em" }}>
          {label}
        </text>
      </g>
    ))}

    {/* Decision diamond */}
    <polygon points="170,80 190,100 170,120 150,100" fill="#00FFB215" stroke="#00FFB2" strokeWidth="1" />
  </svg>
);

// ─── CURSOR GLOW ─────────────────────────────────────────────────
const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div className="cursor-glow" style={{ left: pos.x, top: pos.y }} />;
};

// ─── NAV ─────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: "About" },
    { href: "#riyadh", label: "Riyadh" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
      <a href="#hero" className="display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--mint)" }}>
        VJ<span style={{ color: "var(--text-muted)" }}>.</span>
      </a>
      <div className="nav-links" style={{ display: "flex", gap: "2.5rem" }}>
        {links.map(({ href, label }) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </div>
      <a
        href="mailto:vishnujangid256@gmail.com"
        style={{
          background: "var(--mint)", color: "var(--void)", padding: "0.5rem 1.2rem",
          borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: "0.78rem",
          fontWeight: 600, textDecoration: "none", letterSpacing: "0.05em",
        }}
      >
        Hire Me
      </a>
    </motion.nav>
  );
};

// ─── SECTION REVEAL WRAPPER ────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const words = ["Senior", "Appian", "Developer."];

  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Ambient grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
      }} />

      {/* Ambient blobs */}
      <div style={{
        position: "absolute", top: "20%", left: "60%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, #00FFB210 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, #7B61FF10 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      <motion.div style={{ y, opacity }} className="container">
        <div style={{ maxWidth: 780 }}>
          <motion.div
            className="label"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginBottom: "1.5rem" }}
          >
            ◆ &nbsp;Available for opportunities
          </motion.div>

          <div className="display" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 700, lineHeight: 1.05, marginBottom: "1.5rem" }}>
            {["Vishnu", "Jangid"].map((word, i) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {i === 0 ? (
                  <span style={{ color: "var(--text)" }}>{word} </span>
                ) : (
                  <span className="mint glow-mint">{word}</span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="display"
            style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1.5rem" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Senior Appian Developer&nbsp;
            <span style={{
              background: "linear-gradient(135deg, var(--mint), var(--violet))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              · 4.4 Years
            </span>
          </motion.div>

          <motion.p
            style={{ fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: 540, marginBottom: "2.5rem", lineHeight: 1.7 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            Designing, developing, and deploying enterprise-grade BPM solutions that turn
            complex workflows into frictionless digital experiences.
          </motion.p>

          <motion.div
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "4rem" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <a href="#projects" style={{
              background: "var(--mint)", color: "var(--void)", padding: "0.85rem 2rem",
              borderRadius: 8, fontWeight: 700, textDecoration: "none",
              fontFamily: "Geist", fontSize: "0.95rem", letterSpacing: "0.03em",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 0 30px #00FFB260"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = ""; e.target.style.transform = ""; }}
            >
              View Projects
            </a>
            <a href="#contact" style={{
              border: "1px solid #ffffff20", color: "var(--text)", padding: "0.85rem 2rem",
              borderRadius: 8, fontWeight: 500, textDecoration: "none",
              fontFamily: "Geist", fontSize: "0.95rem",
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "var(--mint)"; e.target.style.color = "var(--mint)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#ffffff20"; e.target.style.color = "var(--text)"; }}
            >
              Get in Touch
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <WorkflowSVG />
            <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              // appian process model — intake → route → review → approve → deploy
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "2rem" }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          {[
            { val: "4.4", unit: "yrs", label: "Experience" },
            { val: "89+", unit: "svcs", label: "Digitized" },
            { val: "L2", unit: "cert", label: "Appian" },
          ].map(({ val, unit, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div className="display" style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--mint)", lineHeight: 1 }}>
                {val}<span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: 2 }}>{unit}</span>
              </div>
              <div className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.12em", marginTop: 4 }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
      >
        <motion.div
          style={{ width: 1, height: 60, background: "linear-gradient(180deg, var(--mint), transparent)", margin: "0 auto" }}
          animate={{ scaleY: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};

// ─── ABOUT ────────────────────────────────────────────────────────
const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-pad" ref={ref}>
      <div className="container">
        <Reveal>
          <div className="label" style={{ marginBottom: "1rem" }}>◆ &nbsp;About Me</div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          <Reveal>
            <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.5rem" }}>
              Turning complex business processes into{" "}
              <span className="mint">elegant digital flows.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.2rem" }}>
              I'm a Senior Appian Developer with a deep passion for solving real business problems through
              scalable, maintainable BPM applications. My work sits at the intersection of process
              engineering and interface craft.
            </p>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              From modeling intricate approval chains to crafting SAIL interfaces that users actually enjoy,
              I bring both technical rigor and UX sensibility to every engagement — including on-site delivery
              at government clients in the Middle East.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {[
                {
                  icon: "⚙️",
                  title: "Process Modeling",
                  desc: "Designing end-to-end workflows with Appian's process model engine, audit trails, and exception handling.",
                  color: "var(--mint)",
                },
                {
                  icon: "🖥️",
                  title: "SAIL Interface Development",
                  desc: "Building responsive, accessible, pattern-compliant Appian interfaces that integrate seamlessly with business logic.",
                  color: "var(--violet)",
                },
                {
                  icon: "🔗",
                  title: "API Integration",
                  desc: "Connecting Appian applications to external systems through Web APIs, enabling real-time data exchange.",
                  color: "var(--amber)",
                },
              ].map(({ icon, title, desc, color }) => (
                <motion.div
                  key={title}
                  className="card"
                  style={{ padding: "1.4rem 1.6rem", display: "flex", gap: "1rem" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>{icon}</div>
                  <div>
                    <div className="display" style={{ fontWeight: 600, marginBottom: "0.3rem", color }}>{title}</div>
                    <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── RIYADH EXPERIENCE ────────────────────────────────────────────
const Riyadh = () => {
  const [activeStep, setActiveStep] = useState(0);

  const timeline = [
    {
      phase: "Discovery",
      period: "Onsite · Riyadh, KSA",
      title: "Stakeholder Requirement Gathering",
      desc: "Worked directly with senior government stakeholders at the Ministry to gather, validate, and document functional and non-functional requirements for the citizen-facing portal.",
      icon: "🤝",
    },
    {
      phase: "Architecture",
      period: "Design Phase",
      title: "Portal Architecture & Service Design",
      desc: "Designed the technical architecture for a multi-domain portal spanning tourism, entertainment, scholarship, and social development verticals, each with unique workflow topologies.",
      icon: "🏛️",
    },
    {
      phase: "Build",
      period: "Development Sprints",
      title: "Citizen E-Services Portal",
      desc: "Built and delivered the Middle East Government E-Services Portal — a citizen-facing platform offering digitized public services to thousands of users across multiple government domains.",
      icon: "🚀",
    },
    {
      phase: "Support",
      period: "Go-Live & Hypercare",
      title: "Application Support & Optimization",
      desc: "Provided on-site application support post-launch, resolving critical issues in real-time and optimizing workflows based on live usage patterns to streamline public service delivery.",
      icon: "🛡️",
    },
  ];

  return (
    <section id="riyadh" className="section-pad" style={{
      background: `linear-gradient(180deg, var(--void) 0%, #1a0f0a 30%, #0f0a1a 70%, var(--void) 100%)`,
      overflow: "hidden",
    }}>
      {/* Desert horizon line */}
      <div style={{
        position: "absolute", top: "10%", left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, var(--amber) 30%, var(--amber) 70%, transparent)",
        opacity: 0.2,
      }} />

      <div className="container">
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div className="label" style={{ color: "var(--amber)" }}>◆ &nbsp;On-Site Experience</div>
            <div style={{
              background: "var(--amber-dim)", border: "1px solid var(--amber)",
              padding: "0.2rem 0.8rem", borderRadius: 9999, fontSize: "0.72rem",
              fontFamily: "JetBrains Mono", color: "var(--amber)",
            }}>
              🌍 On-Site · Riyadh, Saudi Arabia
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, marginBottom: "0.8rem", lineHeight: 1.1 }}>
            Working on-site in Riyadh, Saudi Arabia.
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 600, marginBottom: "3.5rem", lineHeight: 1.7 }}>
            I spent time working directly with a government client in Riyadh, helping them build and launch
            a citizen-facing portal that made public services available online for the first time.
          </p>
        </Reveal>

        {/* Impact stat bar */}
        <Reveal delay={0.2}>
          <div style={{ display: "flex", gap: "1px", marginBottom: "4rem" }}>
            {[
              { val: "4", label: "Domains" },
              { val: "89+", label: "Services" },
              { val: "9mo", label: "Delivered" },
              { val: "Gov", label: "Client Tier" },
            ].map(({ val, label }, i) => (
              <div key={label} style={{
                flex: 1, padding: "1.5rem", background: "var(--surface-2)",
                border: "1px solid var(--border)", textAlign: "center",
                borderLeft: i === 0 ? "3px solid var(--amber)" : undefined,
              }}>
                <div className="display" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--amber)" }}>{val}</div>
                <div className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.15em" }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Interactive Timeline */}
        <Reveal delay={0.25}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }}>
            {/* Steps list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {timeline.map((step, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    background: activeStep === i ? "var(--amber-dim)" : "transparent",
                    border: `1px solid ${activeStep === i ? "var(--amber)" : "var(--border)"}`,
                    borderRadius: 10, padding: "1rem 1.2rem",
                    display: "flex", alignItems: "center", gap: "0.8rem",
                    cursor: "pointer", textAlign: "left", color: "var(--text)",
                    transition: "all 0.25s",
                  }}
                  whileHover={{ x: 4 }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{step.icon}</span>
                  <div>
                    <div className="mono" style={{ fontSize: "0.65rem", color: activeStep === i ? "var(--amber)" : "var(--text-muted)", letterSpacing: "0.15em" }}>
                      {step.phase.toUpperCase()}
                    </div>
                    <div className="display" style={{ fontWeight: 600, fontSize: "0.92rem" }}>{step.title}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Active step detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                style={{
                  background: "var(--surface-2)", border: `1px solid var(--amber)30`,
                  borderRadius: 16, padding: "2.5rem",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 200, height: 200,
                  background: "radial-gradient(circle, var(--amber-dim), transparent 70%)",
                  pointerEvents: "none",
                }} />
                <div className="mono" style={{ fontSize: "0.7rem", color: "var(--amber)", letterSpacing: "0.15em", marginBottom: "1rem" }}>
                  {timeline[activeStep].period.toUpperCase()}
                </div>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{timeline[activeStep].icon}</div>
                <h3 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {timeline[activeStep].title}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                  {timeline[activeStep].desc}
                </p>

                {activeStep === 2 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {["Tourism", "Entertainment", "Scholarships", "Social Development"].map(tag => (
                      <span key={tag} style={{
                        background: "var(--amber-dim)", border: "1px solid var(--amber)40",
                        borderRadius: 9999, padding: "0.3rem 0.8rem", fontSize: "0.78rem",
                        color: "var(--amber)", fontFamily: "JetBrains Mono",
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── PROJECTS ─────────────────────────────────────────────────────
const Projects = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const projects = [
    {
      id: "01",
      title: "Enterprise Workflow & Reporting Platform",
      role: "Senior Appian Developer",
      company: "Xebia Appcino",
      tags: ["Appian BPM", "MySQL", "Audit Trails", "DB Triggers"],
      accent: "var(--mint)",
      highlight: "Developed audit trail mechanisms using database triggers for full process traceability.",
      desc: "Architected and delivered a large-scale enterprise workflow platform with comprehensive reporting capabilities. Implemented database-level audit triggers ensuring regulatory compliance.",
      icon: "📊",
    },
    {
      id: "02",
      title: "Medical Affairs & Drug Management Platform",
      role: "Appian Developer",
      company: "Xebia Appcino",
      tags: ["Appian", "Multi-level Approvals", "Automation", "Healthcare"],
      accent: "var(--violet)",
      highlight: "End-to-end automation from request intake through multi-level approval chains.",
      desc: "Built a full lifecycle management system for medical affairs workflows, automating drug request intake, routing, review, and approval across multiple stakeholder tiers.",
      icon: "💊",
    },
    {
      id: "03",
      title: "Government Licensing Platform",
      role: "Senior Developer",
      company: "Saudi Arabia · Gov",
      tags: ["Appian BPM", "Process Automation", "Gov-Tech", "Arabic"],
      accent: "var(--amber)",
      highlight: "Reduced manual licensing processes through automated approval chains.",
      desc: "Delivered an automated government licensing platform for the Saudi market, replacing paper-heavy manual processes with streamlined digital approval flows and stakeholder notifications.",
      icon: "🏛️",
    },
    {
      id: "04",
      title: "Government Social Services Digitization",
      role: "Lead Developer",
      company: "Saudi Arabia · Gov",
      tags: ["Appian", "89 Services", "9-Month Delivery", "Scale"],
      accent: "var(--mint)",
      highlight: "89 social and welfare services digitized within a strict 9-month timeline.",
      desc: "Led the rapid digitization of 89 government social and welfare services under an aggressive 9-month deadline. Engineered reusable components to achieve scale without compromising quality.",
      icon: "🌐",
    },
  ];

  return (
    <section id="projects" className="section-pad">
      <div className="container">
        <Reveal>
          <div className="label" style={{ marginBottom: "1rem" }}>◆ &nbsp;Core Projects & Experience</div>
          <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "3.5rem", lineHeight: 1.1 }}>
            Work that ships at{" "}
            <span className="violet glow-violet">enterprise scale.</span>
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "1.5rem" }}>
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <motion.div
                className="card"
                style={{ padding: "2rem", height: "100%", cursor: "default", position: "relative", overflow: "hidden" }}
                onHoverStart={() => setHoveredIdx(i)}
                onHoverEnd={() => setHoveredIdx(null)}
              >
                {/* Accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: p.accent, opacity: hoveredIdx === i ? 1 : 0.3, transition: "opacity 0.3s" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
                  <div>
                    <span className="mono" style={{ fontSize: "0.7rem", color: p.accent, letterSpacing: "0.15em" }}>
                      {p.id} / {p.company}
                    </span>
                    <div style={{ fontSize: "1.5rem", marginTop: "0.3rem" }}>{p.icon}</div>
                  </div>
                  <motion.div
                    style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${p.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", color: p.accent, fontSize: "0.8rem" }}
                    animate={{ rotate: hoveredIdx === i ? 45 : 0 }}
                  >→</motion.div>
                </div>

                <h3 className="display" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.8rem", lineHeight: 1.3 }}>
                  {p.title}
                </h3>

                <div style={{
                  background: p.accent + "12", border: `1px solid ${p.accent}30`,
                  borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem",
                  fontSize: "0.85rem", color: p.accent, lineHeight: 1.5,
                }}>
                  ✦ {p.highlight}
                </div>

                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.2rem" }}>
                  {p.desc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {p.tags.map(tag => (
                    <span key={tag} style={{
                      background: "var(--void)", border: "1px solid var(--border)",
                      borderRadius: 6, padding: "0.25rem 0.6rem",
                      fontSize: "0.72rem", fontFamily: "JetBrains Mono", color: "var(--text-muted)",
                    }}>{tag}</span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SKILLS ───────────────────────────────────────────────────────
const Skills = () => {
  const skills = [
    { name: "Appian BPM", level: 95, color: "var(--mint)" },
    { name: "SAIL Development", level: 90, color: "var(--mint)" },
    { name: "Process Modeling", level: 92, color: "var(--mint)" },
    { name: "MySQL", level: 80, color: "var(--violet)" },
    { name: "Web APIs / REST", level: 85, color: "var(--violet)" },
    { name: "Appian Integrations", level: 88, color: "var(--violet)" },
    { name: "Stakeholder Management", level: 85, color: "var(--amber)" },
    { name: "Agile / Scrum", level: 80, color: "var(--amber)" },
    { name: "Gov-Tech Delivery", level: 90, color: "var(--amber)" },
  ];

  const certs = [
    { name: "Appian L1 Certified", icon: "🏅", desc: "Appian Associate Developer", color: "var(--mint)" },
    { name: "Appian L2 Certified", icon: "🏆", desc: "Appian Senior Developer", color: "var(--violet)" },
  ];

  return (
    <section id="skills" className="section-pad" style={{ background: "var(--surface)" }}>
      <div className="container">
        <Reveal>
          <div className="label" style={{ marginBottom: "1rem" }}>◆ &nbsp;Skills & Certifications</div>
          <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "3.5rem" }}>
            The technical arsenal.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "4rem" }}>
          {/* Skills */}
          <Reveal>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  className="skill-bubble"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  style={{
                    background: skill.color + "10",
                    borderColor: skill.color + "40",
                    color: skill.color,
                    padding: "0.7rem 1.4rem",
                    borderRadius: 9999,
                    border: "1px solid",
                    fontFamily: "JetBrains Mono",
                    fontSize: "0.82rem",
                    cursor: "default",
                    transition: "all 0.25s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  whileHover={{
                    scale: 1.08,
                    boxShadow: `0 0 20px ${skill.color}30`,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: skill.color, flexShrink: 0 }} />
                  {skill.name}
                  <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{skill.level}%</span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* Certs */}
          <Reveal delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div className="display" style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Certifications
              </div>
              {certs.map((cert) => (
                <motion.div
                  key={cert.name}
                  className="card"
                  style={{ padding: "1.5rem 1.8rem", border: `1px solid ${cert.color}30`, position: "relative", overflow: "hidden" }}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${cert.color}20` }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
                    background: cert.color,
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "2rem" }}>{cert.icon}</span>
                    <div>
                      <div className="display" style={{ fontWeight: 700, color: cert.color, fontSize: "1rem" }}>{cert.name}</div>
                      <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{cert.desc}</div>
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", top: "50%", right: "1.5rem", transform: "translateY(-50%)",
                    width: 32, height: 32, borderRadius: "50%",
                    background: cert.color + "20", display: "flex", alignItems: "center",
                    justifyContent: "center", color: cert.color, fontWeight: 700, fontSize: "0.8rem",
                  }}>
                    ✓
                  </div>
                </motion.div>
              ))}

              {/* Experience badge */}
              <motion.div
                style={{
                  marginTop: "0.5rem", padding: "1.5rem", borderRadius: 12,
                  background: "linear-gradient(135deg, var(--mint-dim), var(--violet-dim))",
                  border: "1px solid var(--mint)30", textAlign: "center",
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="display" style={{ fontSize: "3rem", fontWeight: 800, background: "linear-gradient(135deg, var(--mint), var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  4.4
                </div>
                <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.15em" }}>YEARS OF EXPERIENCE</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Appian BPM Platform</div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── CONTACT ──────────────────────────────────────────────────────
const Contact = () => (
  <section id="contact" className="section-pad">
    <div className="container">
      <Reveal>
        <div className="label" style={{ marginBottom: "1rem" }}>◆ &nbsp;Contact</div>
        <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "0.5rem" }}>
          Let's build something{" "}
          <span className="mint glow-mint">together.</span>
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: 500, marginBottom: "3.5rem", lineHeight: 1.7 }}>
          Open to senior roles, enterprise consulting, and complex BPM transformation projects globally.
        </p>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", maxWidth: 840 }}>
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { icon: "✉️", label: "Email", value: "vishnujangid256@gmail.com", href: "mailto:vishnujangid256@gmail.com", color: "var(--mint)" },
              { icon: "📞", label: "Phone", value: "+91 7357576924", href: "tel:+917357576924", color: "var(--violet)" },
              { icon: "📍", label: "Location", value: "Jaipur, Rajasthan, India", href: null, color: "var(--amber)" },
            ].map(({ icon, label, value, href, color }) => (
              <motion.a
                key={label}
                href={href || undefined}
                className="card"
                style={{
                  padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem",
                  textDecoration: "none", color: "var(--text)", borderLeft: `3px solid ${color}`,
                }}
                whileHover={{ x: 6, borderColor: color }}
              >
                <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                <div>
                  <div className="mono" style={{ fontSize: "0.65rem", color: color, letterSpacing: "0.15em", marginBottom: "0.15rem" }}>{label.toUpperCase()}</div>
                  <div className="display" style={{ fontWeight: 500, fontSize: "0.95rem" }}>{value}</div>
                </div>
              </motion.a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "2rem", height: "100%", display: "flex", flexDirection: "column",
          }}>
            <div className="display" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Senior Appian Developer
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Available for new engagements. Specialized in enterprise BPM,
              government digital transformation, and cross-border on-site delivery.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {["Appian L2", "BPM", "Gov-Tech", "On-Site"].map(tag => (
                <span key={tag} style={{
                  background: "var(--mint-dim)", border: "1px solid var(--mint)30",
                  borderRadius: 9999, padding: "0.25rem 0.7rem", fontSize: "0.72rem",
                  fontFamily: "JetBrains Mono", color: "var(--mint)",
                }}>{tag}</span>
              ))}
            </div>
            <motion.a
              href="mailto:vishnujangid256@gmail.com"
              style={{
                display: "block", textAlign: "center", background: "var(--mint)", color: "var(--void)",
                padding: "0.9rem", borderRadius: 8, fontWeight: 700, textDecoration: "none",
                fontFamily: "Geist", marginTop: "auto",
              }}
              whileHover={{ boxShadow: "0 0 30px #00FFB260" }}
              whileTap={{ scale: 0.98 }}
            >
              Send a Message →
            </motion.a>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    borderTop: "1px solid var(--border)", padding: "2rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: "1rem",
  }}>
    <div className="display" style={{ fontWeight: 700, color: "var(--mint)" }}>VJ<span style={{ color: "var(--text-muted)" }}>.</span></div>
    <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
      © 2025 VISHNU JANGID · SENIOR APPIAN DEVELOPER · JAIPUR, INDIA
    </div>
    <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
      Built with React · Framer Motion
    </div>
  </footer>
);

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <GlobalStyles />
      <CursorGlow />
      <Nav />
      <main>
        <Hero />
        <About />
        <Riyadh />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
