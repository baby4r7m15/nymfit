import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 60 * 5, // 5 min — shared across all consumers
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['me'] });

  return (
    <UserContext.Provider value={{ user, isLoading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}