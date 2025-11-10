'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useAuthContext } from './AuthContext';

interface MembershipContextType {
  isMember: boolean;
  loading: boolean;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // In a real app, you'd fetch membership status from your backend
  // For now, we'll just simulate it.
  React.useEffect(() => {
    setLoading(true);
    if (user) {
      // Simulate checking membership. For now, let's say all users are members.
      setIsMember(true);
    } else {
      setIsMember(false);
    }
    setLoading(false);
  }, [user]);

  const value = { isMember, loading };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
