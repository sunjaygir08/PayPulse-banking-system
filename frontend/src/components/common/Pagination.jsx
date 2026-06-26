import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`pagination-container ${className}`}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Page {currentPage} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
