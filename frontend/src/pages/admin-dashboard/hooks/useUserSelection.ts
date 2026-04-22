import { useState, useCallback } from "react";

export const useUserSelection = (filteredUsers: { _id: string }[]) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  }, [filteredUsers]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  return {
    selectedUsers,
    setSelectedUsers,
    handleSelectUser,
    handleSelectAll,
    clearSelection,
  };
};

