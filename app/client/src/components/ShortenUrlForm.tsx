import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ShortenUrlFormProps {
  onUrlAdded: () => void;
}

const ShortenUrlForm: React.FC<ShortenUrlFormProps> = ({ onUrlAdded }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Clear the error text after a successful login.
    if (isAuthenticated) setError(null);
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Login required to create shortened URLs');
      return;
    }
  
    setLoading(true);

    try {
      await ApiService.shortenUrl(url);
      setUrl('');
      onUrlAdded();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shorten-url-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ShortenUrlForm;
