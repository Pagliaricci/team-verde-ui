import { Autocomplete, Box, Button, Divider, TextField, Typography } from "@mui/material";
import { ModalWrapper } from "../common/ModalWrapper.tsx";
import { useGetUsers } from "../../utils/queries.tsx";
import { useEffect, useState } from "react";
import { User } from "../../utils/users.ts";

type ShareSnippetModalProps = {
  open: boolean;
  onClose: () => void;
  onShare: (userId: string) => void;
  loading: boolean;
};

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const { open, onClose, onShare, loading } = props;
  const [name, setName] = useState<string>(""); // Current input value
  const [debouncedName, setDebouncedName] = useState<string>(""); // Delayed API input
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Selected user

  // Fetch users from API
  const { data, isLoading } = useGetUsers(debouncedName, 0, 10);

  // Debounce input to reduce API calls
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedName(name);
    }, 300); // Debounce time: 300ms
    return () => clearTimeout(debounceTimeout);
  }, [name]);

  // Handle user selection
  const handleSelectUser = (newValue: User | null) => {
    setSelectedUser(newValue);
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <Typography variant="h5">Share your snippet</Typography>
      <Divider />
      <Box mt={2}>
        <Autocomplete
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search users"
              onChange={(e) => setName(e.target.value)} // Update input value
            />
          )}
          options={data?.users || []} // API response
          getOptionLabel={(option) => option.nickname} // Use nickname for display
          isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
          loading={isLoading} // Show spinner during loading
          onChange={(_, newValue) => handleSelectUser(newValue)} // Update selected user
        />
        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            disabled={!selectedUser || loading} // Disable if no user selected or loading
            onClick={() => selectedUser && onShare(selectedUser.id)} // Trigger share
            sx={{ ml: 2 }}
            variant="contained"
          >
            Share
          </Button>
        </Box>
      </Box>
    </ModalWrapper>
  );
};
