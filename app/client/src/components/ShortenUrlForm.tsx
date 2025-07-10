import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { useToken } from '../contexts/TokenContext';

const ShortenUrlForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useToken();

  useEffect(() => {
    // Clear the error text after a successful login.
    if (token) setError(null);
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Login required to create shortened URLs');
      return;
    }
  
    setLoading(true);

    try {
      await ApiService.shortenUrl(url);
      setUrl('');
      // TODO: Add success message or redirect
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
