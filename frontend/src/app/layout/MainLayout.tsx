import {AppBar, Button, Stack, styled, Toolbar, Typography} from "@mui/material";
import {Link, Outlet} from "react-router-dom";
import type {ReactNode} from "react";
import { APP_ROUTES } from "../../constants";

const Container = styled(Stack)(({theme}) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    width: '100vw',
    minHeight: '100%',
    '&::before': {
        content: '""',
        display: "block",
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 95%), hsl(0,0%,100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        })
    }
}));

interface MailLayoutProps {
    children?: ReactNode;
}

const MainLayout = ({ children }: MailLayoutProps) => {
  return (
    <Container>
        <Stack sx={{minHeight: "100%", overflowX: 'hidden', flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Button component={Link} to={APP_ROUTES.DASHBOARD} color="inherit">
                            SLC AI Demo App
                        </Button>
                    </Typography>
                    <Button component={Link} to={APP_ROUTES.AVATAR_SELECT} color="inherit">Avatar Select</Button>
                    <Button component={Link} to={APP_ROUTES.CHAT_LIST} color="inherit">Chats</Button>
                    <Button component={Link} to={APP_ROUTES.LOGOUT} color="inherit">Log out</Button>
                </Toolbar>
            </AppBar>
            <div style={{flexGrow: 1, padding: '20px'}}>
                {children}
                <Outlet />
            </div>
        </Stack>
    </Container>
  );
}
export default MainLayout;
