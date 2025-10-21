import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import CreatePollModal from './CreatePollModal';

const GlobalPollModal = () => {
  const [showPollModal, setShowPollModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    const handleOpenCreatePollModal = () => {
      // Only allow poll creation from the home page
      if (location.pathname === '/' && currentUser) {
        setShowPollModal(true);
      } else if (location.pathname !== '/') {
        console.log('Poll creation is only available on the home page');
        return;
      } else if (!currentUser) {
        console.log('User must be signed in to create polls');
        return;
      }
    };

    // Listen for the custom event
    window.addEventListener('openCreatePollModal', handleOpenCreatePollModal);

    return () => {
      window.removeEventListener('openCreatePollModal', handleOpenCreatePollModal);
    };
  }, [currentUser, location.pathname]);

  const handleClose = () => {
    setShowPollModal(false);
  };

  return (
    <>
      {showPollModal && (
        <CreatePollModal onClose={handleClose} />
      )}
    </>
  );
};

export default GlobalPollModal;
