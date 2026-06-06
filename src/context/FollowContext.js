import { createContext, useCallback, useContext, useState } from 'react';

const FollowContext = createContext();

export function FollowProvider({ children }) {
  const [followedCreators, setFollowedCreators] = useState(['sara']);

  const toggleFollow = useCallback((creatorId) => {
    setFollowedCreators(prev =>
      prev.includes(creatorId)
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  }, []);

  const isFollowing = useCallback(
    (creatorId) => followedCreators.includes(creatorId),
    [followedCreators]
  );

  return (
    <FollowContext.Provider value={{
      followedCreators,
      toggleFollow,
      isFollowing,
    }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  return useContext(FollowContext);
}