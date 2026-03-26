
import React from 'react';
import { ProjectMember } from '../../types';

interface MemberAvatarProps {
  member?: ProjectMember;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'md', className = '' }) => {
  const sizeClasses = { sm: 'w-6 h-6 text-[9px]', md: 'w-8 h-8 text-[10px]', lg: 'w-10 h-10 text-xs' };
  if (!member) return <div className={`${sizeClasses[size]} rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-500 ${className}`}>?</div>;
  return (
    <img 
      src={member.avatar} 
      alt={member.name} 
      title={member.name}
      referrerPolicy="no-referrer"
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-black ring-1 ring-white/10 ${className}`} 
    />
  );
};

export default MemberAvatar;
