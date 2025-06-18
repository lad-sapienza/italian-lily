import React, { useState } from 'react';

const HomeFlowController = ({ children }) => {
  const [activeView, setActiveView] = useState(null);

  const handleBoxClick = (view) => {
    setActiveView(view);
  };

  return children({ 
    activeView,
    handleBoxClick,
    getVisibilityClass: (view) => activeView === null || activeView === view ? '' : 'inactive'
  });
};

export default HomeFlowController;