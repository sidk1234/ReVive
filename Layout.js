import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --color-primary: #10B981;
          --color-secondary: #06B6D4;
          --color-accent: #3B82F6;
          --color-bg-dark: #0A1628;
          --color-bg-darker: #020610;
        }
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          background: var(--color-bg-darker);
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 58, 95, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10B981 0%, #06B6D4 100%);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #34D399 0%, #22D3EE 100%);
        }

        ::selection {
          background: rgba(16, 185, 129, 0.3);
          color: white;
        }
      `}</style>
      {children}
    </div>
  );
}
