import React, { useState, useEffect } from 'react';
import { ApiResponse, SortField, SortOrder } from '../types';
import { ApiService } from '../services/api';
import UrlItem from './UrlItem';
import Pagination from './Pagination';
import SortControls from './SortControls';

const UrlList: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.fetchUrls({
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        order: order,
      });
      
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [currentPage, perPage, sortBy, order]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy: SortField, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when per page changes
  };

  if (loading) {
    return <div className="loading">Loading URLs...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <strong>Error:</strong> {error}
        <button onClick={fetchUrls} style={{ marginLeft: '10px' }}>
          Retry
        </button>
      </div>
    );
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
    <div>
      <SortControls
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
      />
      
      <div className="url-list">
        <table className="url-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Code</th>
              <th>Status</th>
              <th>Clicks</th>
              <th>Dates</th>
              <th>User</th>
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
