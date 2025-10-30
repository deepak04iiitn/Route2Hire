import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaBug, FaLightbulb } from 'react-icons/fa';
import FeedbackModal from './FeedbackModal';

export default function FeedbackFab() {
  const [modalType, setModalType] = useState(null); // 'bug' | 'feature' | null

  return (
    <>
      {modalType && (
        <FeedbackModal type={modalType} onClose={() => setModalType(null)} />
      )}
      {createPortal(
        <div className="fixed bottom-6 right-6 z-[2147483647] flex flex-col items-end gap-3 pointer-events-none">
          <button
            type="button"
            onClick={() => setModalType('bug')}
            aria-label="Open feedback modal"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-300/40 flex items-center justify-center hover:scale-105 transition pointer-events-auto"
            role="button"
            tabIndex={0}
          >
            <FaBug />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}


