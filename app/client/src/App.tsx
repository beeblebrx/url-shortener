import { useState, useEffect } from 'react';
import ShortenUrlForm from './components/ShortenUrlForm';
import Login from './components/Login';
import UrlList from './components/UrlList';
import { TokenProvider, useToken } from './contexts/TokenContext';
import { ApiService } from './services/api';
import { ApiResponse, SortField, SortOrder } from './types';
import './styles/main.css';

const AppContent: React.FC = () => {
  const { token, setToken } = useToken();
  const [showLogin, setShowLogin] = useState(false);
  const [urlData, setUrlData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');

  const fetchUrls = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.fetchUrls(token, {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        order: order,
      });
      setUrlData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUrls();
    }
  }, [token, currentPage, perPage, sortBy, order]);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setToken(null);
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
        {token && (
          <UrlList
            data={urlData}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onPerPageChange={handlePerPageChange}
            onRetry={fetchUrls}
          />
        )}
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
