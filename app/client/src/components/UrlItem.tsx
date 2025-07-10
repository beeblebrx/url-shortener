import { UrlItem as UrlItemType } from '../types';
import { formatRelativeDate, isExpired, truncateUrl, formatClickCount } from '../utils/formatters';

interface UrlItemProps {
  url: UrlItemType;
}

const UrlItem: React.FC<UrlItemProps> = ({ url }) => {
  const expired = isExpired(url.expires_at, url.is_permanent);
  
  const getStatusBadge = () => {
    if (expired) {
      return <span className="status-badge status-expired">Expired</span>;
    }
    if (url.is_permanent) {
      return <span className="status-badge status-permanent">Permanent</span>;
    }
    return <span className="status-badge status-active">Active</span>;
  };

  const shortUrl = `${window.location.origin}/${url.short_code}`;

  return (
    <tr>
      <td>
        <div className="url-original">
          <a href={url.original_url} target="_blank" rel="noopener noreferrer">
            {truncateUrl(url.original_url)}
          </a>
        </div>
      </td>
      <td>
        <div className="url-short">
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {url.short_code}
          </a>
        </div>
      </td>
      <td>
        <div className="url-status">
          {getStatusBadge()}
        </div>
      </td>
      <td>
        <div className="url-stats">
          <div>{formatClickCount(url.click_count)}</div>
          {url.last_accessed && (
            <div style={{ fontSize: '0.8rem', color: '#999' }}>
              Last: {formatRelativeDate(url.last_accessed)}
            </div>
          )}
        </div>
      </td>
      <td>
        <div style={{ fontSize: '0.9rem' }}>
          <div>Created: {formatRelativeDate(url.created_at)}</div>
          {!url.is_permanent && url.expires_at && (
            <div style={{ color: expired ? '#c33' : '#666' }}>
              Expires: {formatRelativeDate(url.expires_at)}
            </div>
          )}
        </div>
      </td>
      <td>
        {url.user && (
          <div className="url-user">
            {url.user.username}
          </div>
        )}
      </td>
    </tr>
  );
};

export default UrlItem;
