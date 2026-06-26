import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no active records matching this selection.',
  icon: Icon = Database,
  className = ''
}) {
  return (
    <div className={`empty-state ${className}`}>
      <Icon size={42} className="empty-state-icon" />
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
    </div>
  );
}
