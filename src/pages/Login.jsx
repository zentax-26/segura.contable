import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (email === "admin@segura.cl" && password === "1234") {
      localStorage.setItem("auth", "admin");
      window.location.href = "/";
    } else {
      alert("Correo o contraseña incorrectos");
    }
  }

  return (
    <div style={styles.page}>
      <section style={styles.left}>
        <div style={styles.logoBox}>
          <div style={styles.logoText}>SC</div>
          <div style={styles.brand}>SEGURA<br /><span>CONTABLE</span></div>
        </div>

        <h1 style={styles.title}>
          Soluciones<br />
          contables<br />
          <span>inteligentes.</span>
        </h1>

        <p style={styles.desc}>
          Plataforma administrativa integral para despachos contables.
          Gestión de clientes, RRHH, documentos y más.
        </p>

        <div style={styles.dots}>
          <span style={styles.dotActive}></span>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
        </div>
      </section>

      <section style={styles.right}>
        <form style={styles.card} onSubmit={handleLogin}>
          <div style={styles.smallLogo}>
            <div style={styles.logoTextSmall}>SC</div>
            <div style={styles.brandSmall}>SEGURA<br /><span>CONTABLE</span></div>
          </div>

          <h2 style={styles.welcome}>Bienvenido</h2>
          <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>

          <label style={styles.label}>CORREO ELECTRÓNICO</label>
          <input
            style={styles.input}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>CONTRASEÑA</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button}>Ingresar →</button>
        </form>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    background: "#0b0b0c",
    color: "#fff",
    fontFamily: "Inter, Arial, sans-serif",
  },
  left: {
    padding: "90px 70px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 25% 45%, rgba(219,116,137,.16), transparent 35%), #090909",
  },
  right: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at 60% 25%, rgba(219,116,137,.14), transparent 35%), #151515",
    boxShadow: "inset 20px 0 60px rgba(0,0,0,.35)",
  },
  logoBox: {
    width: 170,
    height: 170,
    background: "#fff",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
    boxShadow: "0 0 0 14px rgba(255,255,255,.07)",
    color: "#222",
  },
  logoText: {
    fontFamily: "Georgia, serif",
    fontSize: 48,
    color: "#d98294",
    lineHeight: 1,
  },
  brand: {
    marginTop: 10,
    letterSpacing: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#222",
  },
  title: {
    fontFamily: "Georgia, serif",
    fontSize: 48,
    fontWeight: 400,
    lineHeight: 1.2,
    margin: 0,
  },
  desc: {
    maxWidth: 390,
    color: "#777",
    marginTop: 25,
    lineHeight: 1.7,
    fontSize: 14,
  },
  dots: {
    display: "flex",
    gap: 8,
    marginTop: 35,
    justifyContent: "center",
    maxWidth: 170,
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 99,
    background: "#e98599",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    background: "#333",
  },
  card: {
    width: 350,
  },
  smallLogo: {
    width: 115,
    height: 115,
    background: "#fff",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    boxShadow: "0 0 0 10px rgba(255,255,255,.06)",
    color: "#222",
  },
  logoTextSmall: {
    fontFamily: "Georgia, serif",
    fontSize: 34,
    color: "#d98294",
  },
  brandSmall: {
    marginTop: 5,
    letterSpacing: 5,
    fontSize: 9,
    textAlign: "center",
    color: "#222",
  },
  welcome: {
    fontSize: 28,
    margin: "0 0 5px",
  },
  subtitle: {
    color: "#777",
    fontSize: 13,
    marginBottom: 25,
  },
  label: {
    fontSize: 11,
    color: "#777",
    letterSpacing: 1.5,
    marginBottom: 8,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "15px",
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#242424",
    color: "#fff",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: 8,
    background: "linear-gradient(135deg, #ee8fa0, #d7637a)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(217,99,122,.35)",
  },
};