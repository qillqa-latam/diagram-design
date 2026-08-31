import type { ReactNode } from 'react';

interface CalloutProps {
  title?: string;
  type?: 'tip' | 'note';
  children: ReactNode;
}

export function Callout({ title, type = 'note', children }: CalloutProps) {
  return (
    <aside className={`callout callout--${type}`}>
      {title ? <div className="callout__title">{title}</div> : null}
      <div>{children}</div>
    </aside>
  );
}
