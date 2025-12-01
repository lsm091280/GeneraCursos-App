import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-sm pb-10">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="flex flex-wrap items-center justify-center gap-1">
          <a href="https://ejemplo.com" className="hover:text-fluor transition-colors">GeneraCursos</a> © 2025 by{' '}
          <a href="https://ejemplo.com" className="hover:text-fluor transition-colors">Luis Solá Mantilla</a> is licensed under{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="hover:text-fluor transition-colors">CC BY-SA 4.0</a>
          <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style={{maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em'}} />
          <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style={{maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em'}} />
          <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" style={{maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em'}} />
        </p>
      </div>
    </footer>
  );
};