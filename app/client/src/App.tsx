import { useState } from 'react';
import ShortenUrlForm from './components/ShortenUrlForm';
import Login from './components/Login';
import { TokenProvider, useToken } from './contexts/TokenContext';
import './styles/main.css';

const AppContent: React.FC = () => {
  const { token, setToken } = useToken();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>URL Shortener</h1>
          <p>Nobody wants your ugly long URLs!</p>
        </div>
        <div className="auth-controls">
          {token ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </header>
      
      <main>
        <ShortenUrlForm />
      </main>

      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLogin(false)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <TokenProvider>
    <AppContent />
  </TokenProvider>
);

export default App;
