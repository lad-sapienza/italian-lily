import React, { useState } from 'react';

const HomeLogic = ({ children }) => {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div 
      className={`home-container ${activeSection ? `${activeSection}-active` : ''}`}
      onClick={(e) => {
        const sectionElement = e.target.closest('[data-section]');
        if (sectionElement) {
          handleSectionClick(sectionElement.dataset.section);
        }
      }}
    >
      {children(activeSection)}
    </div>
  );
};

export default HomeLogic;