import { ChefHat } from 'lucide-react';

export default function EmptyState({ icon: Icon = ChefHat, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-art"><Icon size={30} strokeWidth={1.7} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && <button className="primary-button" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
