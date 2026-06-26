import React from 'react';
import Loader from './Loader';

export default function Table({
  headers = [],
  rows = [],
  renderRow,
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  ...props
}) {
  return (
    <div className="table-wrapper">
      <table className="table-container" {...props}>
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Loader size="sm" />
                  <span style={{ color: 'var(--text-secondary)' }}>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id || idx}>
                {renderRow(row, idx)}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && <div className="table-pagination">{pagination}</div>}
    </div>
  );
}
