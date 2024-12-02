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
  const [name, setName] = useState<string>(""); // Current search input
  const [debouncedName, setDebouncedName] = useState<string>(""); // Delayed input for API call
  const [selectedUser, setSelectedUser] = useState<User | undefined>(); // Selected user

  // Fetch users from the API
  const { data, isLoading } = useGetUsers(debouncedName, 0, 10); // Updated to search in real-time

  // Debounce the search input to reduce API calls
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedName(name); // Update search term after delay
    }, 300); // Adjust debounce timing to 300ms for real-time experience
    return () => clearTimeout(debounceTimeout);
  }, [name]);

  // Handle user selection
  const handleSelectUser = (newValue: User | null) => {
    setSelectedUser(newValue || undefined);
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
                      onChange={(e) => setName(e.target.value)} // Update the input as the user types
                  />
              )}
              options={data?.users || []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name}
              loading={isLoading} // Show loading state
              value={selectedUser}
              onChange={(_, newValue) => handleSelectUser(newValue)}
          />
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button
                disabled={!selectedUser || loading}
                onClick={() => selectedUser && onShare(selectedUser.id)}
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
