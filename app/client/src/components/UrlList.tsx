import { useState } from 'react';
import { ApiResponse, SortField, SortOrder } from '../types';
import UrlItem from './UrlItem';
import Pagination from './Pagination';
import SortControls from './SortControls';

interface UrlListProps {
  title?: string
  data: ApiResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: SortField, order: SortOrder) => void;
  onPerPageChange: (perPage: number) => void;
}

const UrlList: React.FC<UrlListProps> = ({
  title,
  data,
  loading,
  onPageChange,
  onSortChange,
  onPerPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const handleSortChange = (newSortBy: SortField, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
    onSortChange(newSortBy, newOrder);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when per page changes
    onPerPageChange(newPerPage);
  };

  if (loading) {
    return <div className="loading">Loading URLs...</div>;
  }

  if (!data || data.urls.length === 0) {
    return (
      <div className="empty-state">
        <h3>No URLs found</h3>
        <p>There are no shortened URLs to display.</p>
      </div>
    );
  }

  return (
    <div className='url-list'>
      <h2 className='url-list-title'>{title}</h2>
      <SortControls
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
      />
      
      <div>
        <table className="url-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Code</th>
              <th>Status</th>
              <th>Clicks</th>
              <th>Dates</th>
            </tr>
          </thead>
          <tbody>
            {data.urls.map((url) => (
              <UrlItem key={url.short_code} url={url} />
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination
        pagination={data.pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UrlList;
