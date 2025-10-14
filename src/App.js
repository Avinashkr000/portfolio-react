import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import "./App.css";

/***********************
 * Hooks & Utilities
 ***********************/
const useTypewriter = (text, speed = 85) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i < text.length ? setOut(text.slice(0, ++i)) : clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
};

const useMagnetic = (selector = ".cta-btn, .nav-links a, .project-card-3d, .contact-btn") => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    const move = (e, el) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    };
    const leave = (el) => (el.style.transform = "");
    els.forEach((el) => {
      // Store handler references on the element for cleanup
      el._magneticMouseMove = (e) => move(e, el);
      el._magneticMouseLeave = () => leave(el);
      el.addEventListener("mousemove", el._magneticMouseMove);
      el.addEventListener("mouseleave", el._magneticMouseLeave);
    });
    return () =>
      els.forEach((el) => {
        el.removeEventListener("mousemove", el._magneticMouseMove);
        el.removeEventListener("mouseleave", el._magneticMouseLeave);
        delete el._magneticMouseMove;
        delete el._magneticMouseLeave;
      });
  }, [selector]);
};

/***********************
 * 3D Background (Stars)
 ***********************/
function StarsField({ count = 6000 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pts[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pts[i * 3 + 2] = r * Math.cos(phi);
    }
    return pts;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled>
        <PointMaterial size={0.02} sizeAttenuation depthWrite={false} transparent opacity={0.9} />
      </Points>
    </group>
  );
}

function ThreeBackground() {
  return (
    <div className="three-canvas">
      <Canvas camera={{ position: [0, 0, 6], fov: 65 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#02000a", 10, 120]} />
        <StarsField />
      </Canvas>
    </div>
  );
}

/***********************
 * Navbar Component
 ***********************/
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.nav className={`navbar ${scrolled ? "scrolled" : ""}`} initial={{ y: -100 }} animate={{ y: 0 }}>
      <motion.div className="nav-brand" whileHover={{ scale: 1.08, rotate: 3 }}>
        &lt;AK /&gt;
      </motion.div>
      <div className="nav-links">
        {["About", "Skills", "Projects", "Contact"].map((item) => (
          <motion.a key={item} href={`#${item.toLowerCase()}`} whileHover={{ scale: 1.1 }}>
            {item}
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}
/***********************
 * Hero Section + About
 ***********************/
export default function App() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useMagnetic();
  const role = useTypewriter("Backend & DevOps Engineer", 80);

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div className="app">
      {/* LAYERS */}
      <motion.div
        className="aurora-bg"
        animate={{ opacity: [0.55, 0.72, 0.55] }}
        transition={{ duration: 16, repeat: Infinity }}
      />
      <ThreeBackground />
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <motion.div
        className="mouse-follower"
        animate={{ x: mouse.x - 12, y: mouse.y - 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
      />

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <motion.section className="hero-section" style={{ scale, opacity }}>
        <div className="hero-content">
          <motion.span
            className="hero-tag"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            ⚡ Open to Work
          </motion.span>

          <motion.h1
            className="hero-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Hi, I'm Avinash Kumar
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="hero-role">
              {role}
              <span style={{ color: "var(--primary)" }}> |</span>
            </div>
          </motion.div>

          <p className="hero-description">
            Building scalable systems, automating deployments, and solving complex problems.
            Ex-Capgemini | 220+ DSA problems solved | Always learning.
          </p>

          <div className="hero-cta">
            <a href="#projects" className="cta-btn primary">
              View My Work
            </a>
            <a href="#contact" className="cta-btn secondary">
              Let's Talk
            </a>
          </div>
        </div>
      </motion.section>

      {/* ABOUT SECTION */}
      <section id="about" className="section">
        <div className="section-title">
          <h2>About Me</h2>
          <div className="title-underline" />
        </div>

        <div className="about-card">
          <p>
            <strong>👋 Hey!</strong> I'm a passionate Backend & DevOps Engineer who loves building{" "}
            <span className="highlight">scalable systems</span> and automating complex workflows.
            At <span className="highlight">Capgemini</span>, I deployed microservices on AWS,
            built CI/CD pipelines, and contributed to enterprise Spring Boot projects.
          </p>

          <p>
            When I'm not coding, I solve DSA problems (220+), experiment with AI integrations,
            and explore new frameworks. Always learning, always building.
          </p>
        </div>
      </section>
      {/* SKILLS SECTION */}
      <section id="skills" className="section">
        <div className="section-title">
          <h2>Tech Arsenal</h2>
          <div className="title-underline" />
        </div>

        <div className="skills-grid">
          {[
            { name: "Java", icon: "☕", level: 90 },
            { name: "Spring Boot", icon: "🍃", level: 85 },
            { name: "MySQL", icon: "🗄️", level: 82 },
            { name: "Docker", icon: "🐳", level: 78 },
            { name: "AWS", icon: "☁️", level: 72 },
            { name: "Jenkins", icon: "🔧", level: 75 },
            { name: "React", icon: "⚛️", level: 80 },
            { name: "Redis", icon: "⚡", level: 70 },
          ].map((s, i) => (
            <motion.div
              key={s.name}
              className="skill-card"
              whileHover={{ y: -6, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div style={{ fontSize: "2rem" }}>{s.icon}</div>
              <div className="skill-name">{s.name}</div>
              <div className="skill-bar-wrap">
                <motion.div
                  className="skill-bar"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.level}%` }}
                  transition={{ duration: 0.9, delay: i * 0.05 }}
                />
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                {s.level}%
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="section">
        <div className="section-title">
          <h2>Featured Projects</h2>
          <div className="title-underline" />
        </div>

        <div className="projects-grid">
          {[
            {
              title: "Inventory Management System",
              description:
                "Enterprise-grade inventory system with JWT auth, role-based access, and real-time updates.",
              tech: ["Spring Boot", "JWT", "MySQL", "Swagger"],
              github:
                "https://github.com/Avinashkr000/InventoryManagementSystem",
            },
            {
              title: "AI Symptom Checker",
              description:
                "Healthcare AI assistant powered by OpenAI GPT for intelligent symptom analysis.",
              tech: ["Spring Boot", "OpenAI API", "MySQL"],
              github:
                "https://github.com/Avinashkr000/health-symptom-checker",
            },
            {
              title: "Employee Payroll System",
              description:
                "Complete payroll management with automated calculations and reporting.",
              tech: ["Spring Boot", "REST API", "Thymeleaf"],
              github:
                "https://github.com/Avinashkr000/Spring_Employee_Payroll_Application",
            },
            {
              title: "URL Shortener",
              description:
                "High-performance URL shortening service with Redis caching and analytics.",
              tech: ["Spring Boot", "Redis", "REST API"],
              github: "https://github.com/Avinashkr000/UrlShortener",
            },
          ].map((p) => (
            <motion.div
              key={p.title}
              className="project-card-3d"
              whileHover={{
                y: -10,
                rotateX: 5,
                rotateY: 5,
                scale: 1.03,
              }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <div className="project-gradient" />
              <div className="project-content">
                <h3>{p.title}</h3>
                <p style={{ color: "var(--text-dim)" }}>{p.description}</p>
                <div className="tech-tags">
                  {p.tech.map((t) => (
                    <span key={t} className="tech-tag">
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={p.github}
                  className="project-link-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Project →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* CONTACT SECTION */}
      <section id="contact" className="section">
        <div className="section-title">
          <h2>Let's Connect</h2>
          <div className="title-underline" />
        </div>

        <p className="contact-text">
          Have an exciting project or opportunity? I'm always open to discussing
          new ideas and collaborations 🚀
        </p>

        <div className="contact-buttons">
          <motion.a
            href="mailto:ak749299.ak@gmail.com"
            className="contact-btn"
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            📧 Email Me
          </motion.a>

          <motion.a
            href="https://www.linkedin.com/in/avinash-java-backend/"
            target="_blank"
            rel="noreferrer"
            className="contact-btn"
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            💼 LinkedIn
          </motion.a>

          <motion.a
            href="https://github.com/Avinashkr000"
            target="_blank"
            rel="noreferrer"
            className="contact-btn"
            whileHover={{ scale: 1.08, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            💻 GitHub
          </motion.a>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="footer">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          © 2025 Avinash Kumar • Built with React, Framer Motion & Three.js
        </motion.p>
        <motion.p
          className="footer-quote"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          "Always building, always learning" ☕
        </motion.p>
      </footer>
    </div>
  );
}
