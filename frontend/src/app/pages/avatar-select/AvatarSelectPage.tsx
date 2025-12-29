import {Box, Button, Card, CardActionArea, CardMedia, Grid, Typography} from '@mui/material';
import {useState} from 'react';
import {useNavigate} from "react-router-dom";
import usePreferences from "../../utils/usePreferences.ts";
import {AVATAR_LIST} from "../../utils/getAvatarById.ts";
import type {UserAvatar} from "../../utils/getAvatarById.ts";

const AvatarSelectPage = () => {
    const [selectedAvatar, setSelectedAvatar] = useState<UserAvatar>();
    const navigate = useNavigate();
    const { setUserAvatarId } = usePreferences();

    const confirmAvatar = () => {
        if(selectedAvatar) {
            setUserAvatarId(selectedAvatar.id);
            navigate('/dashboard');
        }
    }

    return (
        <Box display="flex" flexDirection="column" bgcolor="#fafafa" height="100%" >
            <Box flexGrow={1} >
            <Typography variant="h4" align={"center"} gutterBottom>Please Select Your Avatar</Typography>
                <Grid container spacing={3} justifyContent="center">
                    <>
                        {AVATAR_LIST.filter(item => item.label.toLowerCase().indexOf('carer') !== -1).map((avatar) => {
                            const isSelected = selectedAvatar?.label === avatar.label;
                            return (
                                <Grid key={avatar.label}>
                                    <Card
                                        sx={{
                                            border: isSelected ? '3px solid #1976d2' : '1px solid #ccc',
                                            boxShadow: isSelected ? 6 : 1,
                                            transition: 'border 0.2s, box-shadow 0.2s',
                                            position: 'relative',
                                        }}
                                    >
                                        <CardActionArea onClick={() => setSelectedAvatar(avatar)}>
                                            <CardMedia
                                                component="img"
                                                height="120"
                                                image={avatar.src}
                                                alt={avatar.label}
                                                sx={{
                                                    filter: isSelected ? 'none' : 'grayscale(40%)',
                                                    borderRadius: 2,
                                                }}
                                            />
                                            <Typography align="center" variant="subtitle1" sx={{mt: 1}}>
                                                {avatar.label}
                                            </Typography>
                                        </CardActionArea>
                                        <>
                                            {isSelected && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{mt: 2, mb: 1}}
                                                    onClick={confirmAvatar}
                                                >
                                                    Confirm
                                                </Button>
                                            )}
                                        </>
                                    </Card>
                                </Grid>
                            )
                        })}
                    </>
                </Grid>
            </Box>
        </Box>
    );
}

export default AvatarSelectPage;
