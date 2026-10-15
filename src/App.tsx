import React, { useState, useEffect } from 'react';
import { WidgetContainer } from './components/widget/WidgetContainer';
import { ManagerLayout } from './components/manager/ManagerLayout';

export const App: React.FC = () => {
  const [view, setView] = useState<'widget' | 'manager'>('widget');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v === 'manager') {
      setView('manager');
    } else if (v === 'widget') {
      setView('widget');
    }
  }, []);

  if (view === 'widget') {
    return <WidgetContainer />;
  }

  return <ManagerLayout />;
};

export default App;

