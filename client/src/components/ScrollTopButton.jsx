import React, { useState, useEffect } from 'react';

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg transform transition-opacity duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
      }`}
      style={{ width: 52, height: 52 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mx-auto">
        <path d="M12 19V6" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
