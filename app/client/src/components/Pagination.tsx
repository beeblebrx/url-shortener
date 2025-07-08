import React from 'react';
import { PaginationInfo } from '../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, per_page, total, pages, has_next, has_prev } = pagination;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const startItem = (page - 1) * per_page + 1;
  const endItem = Math.min(page * per_page, total);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {total} URLs
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
        >
          Previous
        </button>
        
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            className={`pagination-button ${pageNum === page ? 'active' : ''}`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
