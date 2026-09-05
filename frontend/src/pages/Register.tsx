import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await axios.post('http://localhost:8000/users/', {
        username: username,
        email: email,
        password: password
      });

      setSuccess('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
            Criar <span style={{ color: '#3b82f6' }}>Conta</span>
          </h1>
          <p style={{ color: '#a0a0a0', margin: 0, fontSize: '14px' }}>Registre-se para gerenciar seu estoque</p>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={successStyle}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nome de Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="Ex: joaosilva"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="Ex: joao@email.com"
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
              placeholder="Crie uma senha forte"
              required
            />
          </div>
          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            Já possui uma conta? <Link to="/login" style={linkStyle}>Faça Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

// Estilos
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
  marginBottom: '16px',
  textAlign: 'center'
};

const successStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  color: '#34d399',
  borderRadius: '10px',
  fontSize: '14px',
  marginBottom: '16px',
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

const linkStyle: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontWeight: '500'
};
