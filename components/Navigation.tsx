import React from 'react';
import { ViewState } from '../types';
import { HomeIcon, UtensilsIcon, DumbbellIcon, ShoppingCartIcon, UserIcon } from './Icons';

interface Props {
  currentView: ViewState;
  onChange: (view: ViewState) => void;
}

export const Navigation: React.FC<Props> = ({ currentView, onChange }) => {
  const navItems: { view: ViewState; label: string; icon: React.ElementType }[] = [
    { view: 'DASHBOARD', label: 'Início', icon: HomeIcon },
    { view: 'DIET', label: 'Dieta', icon: UtensilsIcon },
    { view: 'WORKOUT', label: 'Treino', icon: DumbbellIcon },
    { view: 'SHOPPING', label: 'Lista', icon: ShoppingCartIcon },
    { view: 'PROFILE', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-4 shadow-lg z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChange(item.view)}
              className={`flex flex-col items-center transition-colors duration-200 ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
