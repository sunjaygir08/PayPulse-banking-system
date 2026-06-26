import React from 'react';

export default function Badge({
  status = 'active',
  children,
  className = '',
  ...props
}) {
  const getBadgeClass = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
        return 'badge-active';
      case 'frozen':
      case 'failed':
      case 'rejected':
        return 'badge-frozen';
      case 'pending':
      case 'queued':
        return 'badge-pending';
      case 'paid':
        return 'badge-paid';
      default:
        return 'badge-active';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()} ${className}`} {...props}>
      {children || status}
    </span>
  );
}
