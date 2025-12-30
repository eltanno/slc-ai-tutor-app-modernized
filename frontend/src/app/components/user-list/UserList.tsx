import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Typography,
    Chip,
    TextField,
    InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useGetAllUsersQuery } from "../../services/Auth.api";
import type { UserData } from "../../types/User";
import { useState, useMemo } from "react";
import AsyncDataWrapper from "../async-data-wrapper";
import EmptyState from "../empty-state";

interface UserListProps {
    onUserClick: (user: UserData) => void;
    selectedUserId?: number;
}

const UserList = ({ onUserClick, selectedUserId }: UserListProps) => {
    const { data, isLoading, error } = useGetAllUsersQuery({ page: 1, page_size: 100 });
    const [searchTerm, setSearchTerm] = useState("");

    const allUsers = useMemo(() => data?.items || [], [data?.items]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return allUsers;

        const lowerSearch = searchTerm.toLowerCase();
        return allUsers.filter(user =>
            user.username.toLowerCase().includes(lowerSearch) ||
            user.email.toLowerCase().includes(lowerSearch) ||
            (user.first_name && user.first_name.toLowerCase().includes(lowerSearch)) ||
            (user.last_name && user.last_name.toLowerCase().includes(lowerSearch))
        );
    }, [allUsers, searchTerm]);

    const users = filteredUsers;

    return (
        <AsyncDataWrapper
            isLoading={isLoading}
            error={error}
            errorMessage="Failed to load users. Please try again later."
        >
            <Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search users by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {users.length} {users.length === 1 ? 'user' : 'users'} {searchTerm && `(filtered from ${allUsers.length} total)`}
                </Typography>

                {users.length === 0 ? (
                    <EmptyState
                        message={searchTerm ? 'No users match your search.' : 'No users found.'}
                    />
                ) : (
                    <List>
                        {users.map((user) => (
                            <ListItem
                                key={user.id}
                                disablePadding
                                sx={{
                                    mb: 1,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: selectedUserId === user.id ? 'primary.main' : 'divider',
                                    bgcolor: selectedUserId === user.id ? 'action.selected' : 'background.paper'
                                }}
                            >
                                <ListItemButton onClick={() => onUserClick(user)}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="h6" component="span">
                                                    {user.username}
                                                </Typography>
                                                {user.is_staff && (
                                                    <Chip label="Staff" size="small" color="primary" />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                                {user.first_name && user.last_name && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.first_name} {user.last_name}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.chat_count !== undefined ? user.chat_count : 0} {user.chat_count === 1 ? 'chat' : 'chats'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </AsyncDataWrapper>
    );
};

export default UserList;
