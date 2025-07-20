import { useState, useEffect } from 'react';
import ShortenUrlForm from './components/ShortenUrlForm';
import Login from './components/Login';
import Registration from './components/Registration';
import UrlList from './components/UrlList';
import ErrorMessage from './components/Error';
import { ErrorWithStatus } from './services/ErrorWithCode';
import { TokenProvider, useAuth } from './contexts/AuthContext';
import { ApiService } from './services/api';
import { ApiResponse, SortField, SortOrder } from './types';
import './styles/main.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, username } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [urlData, setUrlData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');

  const fetchUrls = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.fetchUrls({
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        order: order,
      });
      setUrlData(response);
    } catch (err) {
      if ((err as ErrorWithStatus).status === 401) {
        await logout();
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUrls();
    }
  }, [isAuthenticated, currentPage, perPage, sortBy, order]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
  };

  const handleLogout = async () => {
    await logout();
    setUrlData(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy: SortField, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleUrlAdded = () => {
    fetchUrls();
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>URL Shortener</h1>
          <p>Nobody wants your ugly long URLs!</p>
        </div>
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span>Welcome, {username}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLogin(true)}>Login</button>
              <button onClick={() => setShowRegistration(true)}>Sign up</button>
            </>
          )}
        </div>
      </header>
      
      <main>
        <ShortenUrlForm onUrlAdded={handleUrlAdded}/>
        {isAuthenticated && !error && (
          <UrlList
            title="Your shortened URLs"
            data={urlData}
            loading={loading}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onPerPageChange={handlePerPageChange}

          />
        )}
        {error && (
          <ErrorMessage error={error} />
        )}
      </main>

      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLogin(false)} 
        />
      )}

      {showRegistration && (
        <Registration
          onRegistrationSuccess={handleRegistrationSuccess}
          onClose={() => setShowRegistration(false)}
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
