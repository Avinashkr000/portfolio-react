import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from "@react-three/drei";
import "./App.css";

/***********************
 * Theme System
 ***********************/
const THEME_KEY = "ak_portfolio_theme";

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || "dark";
  });
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  
  const toggle = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  return { theme, toggle };
}

function ThemeToggle({ onClick, theme }) {
  return (
    <motion.button
      className="nav-theme-toggle magnetic"
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: 180 }}
      whileTap={{ scale: 0.9 }}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </motion.button>
  );
}

/***********************
 * Multi-Language Splash Screen
 ***********************/
const welcomeMessages = [
  "Welcome", "Namaste", "नमस्ते", "Bonjour", "Hola", "Hallo", "Ciao", "Olá", "Привет", 
  "مرحبا", "שלום", "नमस्कार", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "வணக்கம்", "നमस्तേ", "నमस्तే", "ನಮಸ್ಕಾರ", 
  "ජය වේවා", "สวัสดี", "Xin chào", "こんにちは", "안녕하세요", "你好", "Selamat datang", 
  "Kia ora", "Salaam", "Merhaba", "Hej", "Hei", "Ahoj", "Sveiki", "Tere", "Moien", 
  "Bună", "Sawasdee", "Habari", "Halo", "Guten Tag", "Shalom", "Asalaam Alaikum", 
  "Szia", "Yassas", "Zdravo", "Aloha", "Mabuhay", "Dobrodošli", "Dia duit", "God dag", 
  "Pozdrav", "Sveiks", "Kamusta", "Kumusta", "Sawubona", "Molo", "Salam", "Jambo"
];

function SplashScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % welcomeMessages.length);
    }, 100);
    
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="splash-content">
            <motion.div
              key={currentIndex}
              className="splash-greeting"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.1 }}
              transition={{ duration: 0.1 }}
            >
              {welcomeMessages[currentIndex]}
            </motion.div>
            
            <motion.div
              className="splash-identity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <div className="identity-name">Avinash Kumar</div>
              <div className="identity-role">Java Backend & DevOps Engineer</div>
            </motion.div>
            
            <motion.div
              className="splash-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 3, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/***********************
 * Advanced Hooks & Utilities
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

const useAdvancedMagnetic = (selector = ".magnetic") => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    const move = (e, el) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 100;
      const strength = Math.max(0, (maxDistance - distance) / maxDistance);
      
      el.style.transform = `
        translate(${x * 0.15 * strength}px, ${y * 0.15 * strength}px) 
        rotate(${x * 0.02}deg) 
        scale(${1 + strength * 0.05})
      `;
    };
    const leave = (el) => (el.style.transform = "");
    els.forEach((el) => {
      el._magneticMouseMove = (e) => move(e, el);
      el._magneticMouseLeave = () => leave(el);
      el.addEventListener("mousemove", el._magneticMouseMove);
      el.addEventListener("mouseleave", el._magneticMouseLeave);
    });
    return () =>
      els.forEach((el) => {
        if (el._magneticMouseMove) el.removeEventListener("mousemove", el._magneticMouseMove);
        if (el._magneticMouseLeave) el.removeEventListener("mouseleave", el._magneticMouseLeave);
      });
  }, [selector]);
};

const useParticleTrail = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newParticle = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: Math.random() * 4 + 2,
      };
      
      setParticles(prev => [...prev, newParticle].slice(-20));
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  return particles;
};

/***********************
 * Enhanced 3D Components
 ***********************/
function FloatingGeometry({ position, geometry = "sphere" }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });

  return (
    <mesh ref={ref} position={position}>
      {geometry === "sphere" ? (
        <>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshDistortMaterial
            color="#6366f1"
            transparent
            opacity={0.3}
            distort={0.3}
            speed={2}
            roughness={0.4}
          />
        </>
      ) : (
        <>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <MeshDistortMaterial
            color="#8b5cf6"
            transparent
            opacity={0.4}
            distort={0.2}
            speed={1.5}
          />
        </>
      )}
    </mesh>
  );
}

function InteractiveStars({ count = 6000 }) {
  const ref = useRef();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 120 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pts[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pts[i * 3 + 2] = r * Math.cos(phi);
    }
    return pts;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    ref.current.rotation.x += delta * 0.008;
    
    ref.current.rotation.x += (mouse.y * 0.0001) * delta;
    ref.current.rotation.y += (mouse.x * 0.0001) * delta;
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled>
        <PointMaterial 
          size={0.025} 
          sizeAttenuation 
          depthWrite={false} 
          transparent 
          opacity={0.8}
          color="#ffffff"
        />
      </Points>
    </group>
  );
}

function Enhanced3DBackground() {
  return (
    <div className="three-canvas">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#0a0a0f", 15, 150]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        <InteractiveStars />
        
        <FloatingGeometry position={[-3, 2, -2]} geometry="sphere" />
        <FloatingGeometry position={[4, -1, -3]} geometry="box" />
        <FloatingGeometry position={[-2, -3, -1]} geometry="sphere" />
        <FloatingGeometry position={[3, 3, -4]} geometry="box" />
      </Canvas>
    </div>
  );
}

/***********************
 * Advanced Navbar with Theme Toggle
 ***********************/
function ModernNavbar({ theme, onThemeToggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ["home", "about", "skills", "projects", "contact"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", id: "home", icon: "🏠" },
    { name: "About", id: "about", icon: "👨‍💻" },
    { name: "Skills", id: "skills", icon: "⚡" },
    { name: "Projects", id: "projects", icon: "🚀" },
    { name: "Contact", id: "contact", icon: "📬" },
  ];

  return (
    <motion.nav 
      className={`modern-navbar ${scrolled ? "scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <motion.div 
        className="nav-brand magnetic"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="brand-bracket">&lt;</span>
        <span className="brand-name">AK</span>
        <span className="brand-bracket">/&gt;</span>
      </motion.div>
      
      <div className="nav-links-modern">
        {navItems.map((item) => (
          <motion.a
            key={item.id}
            href={`#${item.id}`}
            className={`nav-link-modern magnetic ${activeSection === item.id ? "active" : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
            {activeSection === item.id && (
              <motion.div
                className="nav-indicator"
                layoutId="navIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.a>
        ))}
      </div>
      
      <ThemeToggle onClick={onThemeToggle} theme={theme} />
    </motion.nav>
  );
}

/***********************
 * Particle Trail
 ***********************/
function ParticleTrail() {
  const particles = useParticleTrail();
  
  return (
    <div className="particle-trail">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              y: particle.y - 30, 
              opacity: 0, 
              scale: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, #6366f1 0%, transparent 70%)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/***********************
 * Enhanced Hero
 ***********************/
function EnhancedHero() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  
  const greeting = useTypewriter("नमस्ते! I'm Avinash Kumar", 100);
  const role = useTypewriter("Java Backend Developer & DevOps Engineer", 60);

  return (
    <motion.section 
      id="home" 
      className="hero-enhanced"
      style={{ scale, opacity }}
    >
      <div className="hero-content-enhanced">
        <motion.div
          className="hero-badge magnetic"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            delay: 0.2,
            duration: 0.8 
          }}
        >
          <span className="badge-dot">🟢</span>
          <span>Available for Work</span>
          <motion.span
            className="badge-pulse"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>

        <motion.h1
          className="hero-title-enhanced"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="title-line">{greeting}</span>
        </motion.h1>

        <motion.div
          className="hero-subtitle-enhanced"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className="subtitle-text">{role}</span>
          <motion.span
            className="cursor"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            |
          </motion.span>
        </motion.div>

        <motion.p
          className="hero-description-enhanced"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Experienced in <span className="highlight">Spring Boot microservices</span>, 
          <span className="highlight"> AWS deployments</span>, and <span className="highlight">CI/CD automation</span>. 
          Ex-<span className="highlight">Capgemini intern</span> with expertise in Redis, Docker, Jenkins, and OpenAI API integration.
        </motion.p>

        <motion.div
          className="hero-stats"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {[
            { label: "Projects", value: "7+" },
            { label: "DSA Solved", value: "220+" },
            { label: "Experience", value: "2 months" },
            { label: "Technologies", value: "15+" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-item magnetic"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="hero-cta-enhanced"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <motion.a
            href="#projects"
            className="cta-primary magnetic"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span>View My Work</span>
            <motion.span
              className="cta-arrow"
              whileHover={{ x: 5 }}
            >
              →
            </motion.span>
          </motion.a>

          <motion.a
            href="#contact"
            className="cta-secondary magnetic"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Let's Connect</span>
            <span className="cta-icon">🤝</span>
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="scroll-mouse magnetic"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          whileHover={{ scale: 1.1 }}
        >
          <div className="scroll-wheel" />
        </motion.div>
        <span className="scroll-text">Scroll to explore</span>
      </motion.div>
    </motion.section>
  );
}

/***********************
 * Enhanced About Section
 ***********************/
function EnhancedAbout() {
  const aboutCards = [
    {
      icon: "👨‍💻",
      title: "Backend Specialist", 
      description: "Expert in Java, Spring Boot, microservices architecture, and RESTful APIs. Capgemini internship experience with enterprise-scale applications."
    },
    {
      icon: "☁️",
      title: "DevOps Engineer",
      description: "Proficient in Docker, AWS (EC2, S3), Jenkins CI/CD pipelines, SonarQube, and infrastructure automation with hands-on production experience."
    },
    {
      icon: "🚀", 
      title: "Problem Solver",
      description: "220+ DSA problems solved, competitive programmer, and AI integration specialist with OpenAI API and LLM prototype development."
    }
  ];

  return (
    <section id="about" className="section-enhanced">
      <div className="container-enhanced">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-enhanced">About Me</h2>
          <div className="section-subtitle">Building scalable systems, one microservice at a time</div>
        </motion.div>

        <div className="about-grid">
          <motion.div
            className="about-story"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="story-card">
              <h3>My Journey</h3>
              <p>
                From <span className="highlight">B.Tech CSE (Data Science)</span> at Technocrats Institute to 
                <span className="highlight"> Capgemini intern</span>, I've evolved from curious student to 
                production-ready backend engineer. Deployed Spring Boot microservices on AWS, built CI/CD 
                pipelines with Jenkins, and optimized database queries with Redis caching.
              </p>
              <p>
                Currently exploring <span className="highlight">AI integration</span> in backend systems, 
                working with OpenAI APIs, and developing LLM-based prototypes. Passionate about clean 
                architecture, scalable design patterns, and DevOps automation.
              </p>
              
              <div className="journey-stats">
                <div className="journey-stat">
                  <span className="stat-number">CGPA 7.33</span>
                  <span className="stat-text">Academic Excellence</span>
                </div>
                <div className="journey-stat">
                  <span className="stat-number">Capgemini</span>
                  <span className="stat-text">Intern Experience</span>
                </div>
                <div className="journey-stat">
                  <span className="stat-number">Production</span>
                  <span className="stat-text">Ready Systems</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="about-cards">
            {aboutCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="about-card-enhanced magnetic"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  rotateX: 5,
                  z: 50
                }}
              >
                <div className="card-icon">{card.icon}</div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <div className="card-glow" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/***********************
 * Enhanced Skills Section
 ***********************/
function EnhancedSkills() {
  const skillCategories = [
    {
      title: "Backend Development",
      icon: "⚙️",
      skills: [
        { name: "Java", level: 90, icon: "☕" },
        { name: "Spring Boot", level: 88, icon: "🍃" },
        { name: "Hibernate", level: 82, icon: "🔄" },
        { name: "JUnit/Mockito", level: 78, icon: "🧪" },
      ]
    },
    {
      title: "DevOps & Cloud",
      icon: "☁️", 
      skills: [
        { name: "AWS (EC2, S3)", level: 75, icon: "☁️" },
        { name: "Docker", level: 80, icon: "🐳" },
        { name: "Jenkins", level: 76, icon: "🔧" },
        { name: "SonarQube", level: 70, icon: "📊" },
      ]
    },
    {
      title: "Databases & Tools",
      icon: "🗄️",
      skills: [
        { name: "MySQL", level: 85, icon: "🗄️" },
        { name: "Redis", level: 78, icon: "⚡" },
        { name: "Postman", level: 88, icon: "📮" },
        { name: "Jira", level: 75, icon: "📋" },
      ]
    },
    {
      title: "Frontend & AI",
      icon: "🎨",
      skills: [
        { name: "React", level: 80, icon: "⚛️" },
        { name: "JavaScript", level: 78, icon: "📜" },
        { name: "OpenAI API", level: 82, icon: "🤖" },
        { name: "Prompt Engineering", level: 85, icon: "🧠" },
      ]
    }
  ];

  return (
    <section id="skills" className="section-enhanced skills-section">
      <div className="container-enhanced">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-enhanced">Technical Arsenal</h2>
          <div className="section-subtitle">Production-tested technologies and frameworks</div>
        </motion.div>

        <div className="skills-categories">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              className="skill-category"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.2 }}
            >
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <h3 className="category-title">{category.title}</h3>
              </div>
              
              <div className="skills-grid-enhanced">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    className="skill-card-enhanced magnetic"
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: [0, -1, 1, 0],
                      transition: { duration: 0.3 }
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: categoryIndex * 0.2 + skillIndex * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <div className="skill-header">
                      <span className="skill-icon">{skill.icon}</span>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                    
                    <div className="skill-progress">
                      <div className="progress-bg">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: categoryIndex * 0.2 + skillIndex * 0.1 + 0.5,
                            duration: 1,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    
                    <div className="skill-glow" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/***********************
 * Enhanced Projects Section
 ***********************/
function EnhancedProjects() {
  const projects = [
    {
      title: "Inventory Management System",
      description: "Enterprise-grade inventory system with JWT authentication, role-based access control, and real-time updates. Built with Spring Boot, MySQL, and deployed on AWS.",
      image: "🏪",
      tech: ["Spring Boot", "JWT", "MySQL", "AWS", "Swagger", "Docker"],
      github: "https://github.com/Avinashkr000/InventoryManagementSystem",
      demo: "#",
      featured: true,
      stats: { stars: 15, forks: 8, commits: 120 }
    },
    {
      title: "AI Symptom Checker", 
      description: "Healthcare AI assistant powered by OpenAI GPT for intelligent symptom analysis and medical guidance recommendations with Redis caching.",
      image: "🏥",
      tech: ["Spring Boot", "OpenAI API", "MySQL", "Redis", "CI/CD"],
      github: "https://github.com/Avinashkr000/health-symptom-checker", 
      demo: "#",
      featured: true,
      stats: { stars: 22, forks: 12, commits: 89 }
    },
    {
      title: "Employee Payroll System",
      description: "Complete payroll management system with automated salary calculations, tax deductions, and comprehensive reporting dashboard using Spring Boot.",
      image: "💼",
      tech: ["Spring Boot", "Thymeleaf", "MySQL", "JUnit", "Jenkins"],
      github: "https://github.com/Avinashkr000/Spring_Employee_Payroll_Application",
      demo: "#",
      featured: false,
      stats: { stars: 18, forks: 10, commits: 95 }
    },
    {
      title: "URL Shortener Service",
      description: "High-performance URL shortening service with Redis caching, analytics dashboard, custom domain support, and Docker containerization.",
      image: "🔗",
      tech: ["Spring Boot", "Redis", "PostgreSQL", "Docker", "AWS"],
      github: "https://github.com/Avinashkr000/UrlShortener",
      demo: "#", 
      featured: false,
      stats: { stars: 25, forks: 15, commits: 76 }
    }
  ];

  return (
    <section id="projects" className="section-enhanced projects-section">
      <div className="container-enhanced">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-enhanced">Featured Projects</h2>
          <div className="section-subtitle">Production-ready applications with real-world impact</div>
        </motion.div>

        <div className="projects-grid-enhanced">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className={`project-card-3d-enhanced magnetic ${project.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                rotateX: 5,
                rotateY: 5,
                scale: 1.02,
                transition: { type: "spring", stiffness: 200 }
              }}
            >
              <div className="project-gradient-bg" />
              
              <div className="project-header">
                <div className="project-image">{project.image}</div>
                <div className="project-stats">
                  <span className="stat">⭐ {project.stats.stars}</span>
                  <span className="stat">🍴 {project.stats.forks}</span>
                </div>
              </div>

              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="tech-stack">
                  {project.tech.map((tech) => (
                    <span key={tech} className="tech-tag-enhanced">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="project-actions">
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="project-btn primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>View Code</span>
                  <span>💻</span>
                </motion.a>
                
                <motion.a
                  href={project.demo}
                  className="project-btn secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Live Demo</span>
                  <span>🚀</span>
                </motion.a>
              </div>
              
              {project.featured && (
                <div className="featured-badge">
                  <span>⭐ Featured</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/***********************
 * Enhanced Contact Section
 ***********************/
function EnhancedContact() {
  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      value: "ak749299.ak@gmail.com",
      link: "mailto:ak749299.ak@gmail.com",
      description: "Professional inquiries welcome"
    },
    {
      icon: "💼", 
      title: "LinkedIn",
      value: "@avinash-java-backend",
      link: "https://www.linkedin.com/in/avinash-java-backend/",
      description: "Let's connect professionally"
    },
    {
      icon: "💻",
      title: "GitHub", 
      value: "@Avinashkr000",
      link: "https://github.com/Avinashkr000",
      description: "Explore my repositories"
    },
    {
      icon: "📱",
      title: "Phone",
      value: "+91 9546057503",
      link: "tel:+919546057503",
      description: "Available for direct communication"
    }
  ];

  return (
    <section id="contact" className="section-enhanced contact-section">
      <div className="container-enhanced">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-enhanced">Let's Build Something Amazing</h2>
          <div className="section-subtitle">Open for opportunities and exciting collaborations</div>
        </motion.div>

        <div className="contact-content">
          <div className="contact-methods">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.link}
                target="_blank"
                rel="noreferrer"
                className="contact-method magnetic"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-info">
                  <h4>{method.title}</h4>
                  <p className="method-value">{method.value}</p>
                  <p className="method-description">{method.description}</p>
                </div>
                <div className="method-arrow">→</div>
              </motion.a>
            ))}
          </div>
          
          <motion.div
            className="contact-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="cta-card">
              <h3>Ready for Your Next Project?</h3>
              <p>I'm currently available for full-time Java Backend roles, DevOps positions, and exciting project collaborations. Let's discuss how we can build scalable solutions together!</p>
              
              <div className="availability-status">
                <span className="status-dot"></span>
                <span>Available for immediate joining</span>
              </div>
              
              <motion.a
                href="mailto:ak749299.ak@gmail.com?subject=Job Opportunity - Java Backend Developer"
                className="contact-primary-btn magnetic"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start a Conversation</span>
                <span>💬</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/***********************
 * Enhanced Footer
 ***********************/
function EnhancedFooter() {
  return (
    <footer className="footer-enhanced">
      <div className="container-enhanced">
        <div className="footer-content">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="brand-logo">
              <span className="brand-bracket">&lt;</span>
              <span className="brand-name">AK</span>
              <span className="brand-bracket">/&gt;</span>
            </div>
            <p>Building scalable backend systems with modern DevOps practices.</p>
            
            <div className="certifications">
              <span className="cert-badge">Java Expert</span>
              <span className="cert-badge">AWS Cloud</span>
              <span className="cert-badge">Spring Boot</span>
            </div>
          </motion.div>
          
          <motion.div
            className="footer-links"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="link-group">
              <h4>Connect</h4>
              <a href="https://github.com/Avinashkr000" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/avinash-java-backend/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="mailto:ak749299.ak@gmail.com">Email</a>
              <a href="tel:+919546057503">Phone</a>
            </div>
            
            <div className="link-group">
              <h4>Projects</h4>
              <a href="#projects">Featured Work</a>
              <a href="https://github.com/Avinashkr000" target="_blank" rel="noreferrer">All Projects</a>
              <a href="#skills">Technologies</a>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p>© 2025 Avinash Kumar • Built with ❤️ using React, Framer Motion & Three.js</p>
          <p className="footer-quote">"Code is poetry that compiles into reality" ☕</p>
        </motion.div>
      </div>
    </footer>
  );
}

/***********************
 * Main App Component
 ***********************/
export default function App() {
  const { scrollYProgress } = useScroll();
  const { theme, toggle } = useTheme();
  const [showMainSite, setShowMainSite] = useState(false);

  useAdvancedMagnetic();

  return (
    <div className={`app theme-${theme}`} data-theme={theme}>
      {!showMainSite && (
        <SplashScreen onComplete={() => setShowMainSite(true)} />
      )}

      <Enhanced3DBackground />
      <ParticleTrail />
      
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      
      <AnimatePresence>
        {showMainSite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <ModernNavbar theme={theme} onThemeToggle={toggle} />
            <EnhancedHero />
            <EnhancedAbout />
            <EnhancedSkills />
            <EnhancedProjects />
            <EnhancedContact />
            <EnhancedFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
