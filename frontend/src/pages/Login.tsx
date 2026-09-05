import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post('http://localhost:8000/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      signIn(response.data.access_token, username);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocorreu um erro no login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
            Estoque<span style={{ color: '#3b82f6' }}>Pro</span>
          </h1>
          <p style={{ color: '#a0a0a0', margin: 0, fontSize: '14px' }}>Faça login para acessar o painel</p>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            Ainda não tem conta? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Registre-se</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

// Estilos premium e dinâmicos
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0f172a',
  backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const glassCardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '40px',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '8px',
  color: '#94a3b8',
  fontWeight: '500'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
};

const errorStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#f87171',
  borderRadius: '10px',
  fontSize: '14px',
  marginBottom: '20px',
  textAlign: 'center'
};

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '14px',
  marginTop: '8px',
  backgroundColor: loading ? '#60a5fa' : '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s, transform 0.1s',
  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4), 0 2px 4px -1px rgba(59, 130, 246, 0.2)',
  transform: loading ? 'none' : 'translateY(0)',
});
