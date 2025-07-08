import React from 'react';
import { SortField, SortOrder } from '../types';

interface SortControlsProps {
  sortBy: SortField;
  order: SortOrder;
  onSortChange: (sortBy: SortField, order: SortOrder) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  order,
  onSortChange,
  perPage,
  onPerPageChange,
}) => {
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortField, order);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(sortBy, e.target.value as SortOrder);
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPerPageChange(parseInt(e.target.value));
  };

  return (
    <div className="controls">
      <div className="sort-controls">
        <label htmlFor="sort-by">Sort by:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortByChange}>
          <option value="created_at">Created Date</option>
          <option value="expires_at">Expiration Date</option>
          <option value="click_count">Click Count</option>
          <option value="short_code">Short Code</option>
        </select>
        
        <label htmlFor="order">Order:</label>
        <select id="order" value={order} onChange={handleOrderChange}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      
      <div className="per-page-controls">
        <label htmlFor="per-page">Per page:</label>
        <select id="per-page" value={perPage} onChange={handlePerPageChange}>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default SortControls;
