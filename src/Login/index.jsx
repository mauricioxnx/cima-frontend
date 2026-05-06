import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate importado
import { useAuth } from '../hooks/useAuth';
import arrowImg from "../assets/arrow.svg";
import logoImg from "../assets/logo.svg";
import "./styles.css";

export default function Login({ onLogin }) { // ✅ apenas um export default

  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => { // ✅ função fechada corretamente
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/dashboard');
    } catch {
      setError('Credenciais inválidas. Verifique o email e a senha.');
    } finally {
      setLoading(false);
    }
  }; // ✅ fecha aqui

  return ( // ✅ return adicionado
    <div className="container">
      <header className="header">
        <img src={logoImg} alt="Workflow" className="logoImg" />
        <span>Por favor digite suas informações de login</span>
      </header>

      <form onSubmit={handleSubmit}> {/* ✅ nome correto */}
        <div className="inputContainer">
          <label htmlFor="email">E-mail</label>
          <input
            type="text"
            id="email"
            placeholder="johndoe@gmail.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="********************"
            value={form.senha}
            onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="button" className="link-button">Esqueceu sua senha?</button>

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'} <img src={arrowImg} alt="->" />
        </button>

        <div className="footer">
          <p>Você não tem uma conta?</p>
          <Link to="/register">Crie a sua conta aqui</Link>
        </div>
      </form>
    </div>
  );
}