import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Mail,
  Search,
  Users,
  Layers,
  Activity,
  Bell,
  Megaphone,
  MessageSquare,
  Share2,
  CheckSquare,
  Settings,
  LogOut,
  ChevronDown,
  Handshake,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Meetings', icon: Calendar },
  { name: 'Google Mails', icon: Mail },
  { name: 'Screening', icon: Search },
  { name: 'Stakeholders', icon: Users },
  { name: 'Groups', icon: Layers },
  { name: 'Engagements', icon: Handshake },
  { name: 'Notifications', icon: Bell },
  { name: 'Announcements', icon: Megaphone },
  { name: 'Chats', icon: MessageSquare },
  { name: 'Portfolio Share', icon: Share2 },
  { name: 'Task Manager', icon: CheckSquare },
  { name: 'Settings', icon: Settings },
];

export const Sidebar = ({ profile, isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState('Announcements');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      // signOut already shows a toast via useAuth — just navigate
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex h-screen w-[280px] lg:w-[256px] flex-shrink-0 flex-col bg-white border-r border-[#EBEAF2]`}>
      {/* Logo Area */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#EBEAF2]">
        <div className="w-8 h-8 rounded-[10px] bg-[#E0E7FF] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-[#312E81]">P</span>
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-semibold text-[14px] leading-none text-[#312E81]">
              Portfoliomate
            </span>
          </div>
          <ChevronDown size={16} className="text-[#90A1B9] hidden lg:block" />
        </div>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav List */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1 pb-[48px]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveItem(item.name);
                if (window.innerWidth < 1024) onClose();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full min-h-[44px] lg:min-h-0 items-center gap-2 rounded-[8px] px-2 py-2.5 lg:py-[7px] text-[14px] font-display font-medium leading-none transition-colors duration-150 ease-out focus:outline-none ${
                isActive
                  ? 'bg-[#312E81] text-white'
                  : 'text-[#171727] hover:bg-[#F8FAFC]'
              }`}
            >
              <item.icon size={16} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="absolute bottom-0 left-0 right-0 h-[48px] bg-[#FAFAFA] border-t lg:border-r border-[#CBD5E1] flex items-center px-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center min-h-[44px] lg:min-h-0 gap-2 rounded-[8px] px-2 py-2.5 lg:py-[7px] text-[14px] font-display font-medium text-[#171727] hover:bg-[#F8FAFC] transition-colors duration-150 ease-out focus:outline-none"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;