import * as React from 'react'
import {Avatar, Chip, Stack} from "@mui/material";

import langfuse_icon from '../../../assets/langfuse_icon.png'
import openwebui_icon from '../../../assets/openwebui_icon.png';
import useLoggedInUser from "../../utils/useLoggedInUser.ts";
import {Link, useNavigate} from "react-router-dom";
import ModalLayout from "../../layout/ModalLayout.tsx";
import { APP_ROUTES } from '../../../constants.ts';

const HomePage = (): React.ReactNode => {
    const host = location.protocol + '//' + window.location.host.split(":")[0]; // Get the host without port
    const {user} = useLoggedInUser();
    const navigate = useNavigate();

    if(user && user.id) {
        navigate(APP_ROUTES.DASHBOARD);
    }

    return (
        <ModalLayout>
        <div className="login-page">
            <h1>SLC AI Demo App</h1>
            <p>If you are having trouble, please contact SLC to continue.</p>
            <Stack gap={1} direction="row" flexWrap="wrap" justifyContent="center" alignItems="center">
                <Chip
                    style={{cursor: 'pointer'}}
                    label="Log In"
                    variant="outlined"
                    component={Link} to={APP_ROUTES.LOGIN}
                />
                <Chip
                    style={{cursor: 'pointer'}}
                    avatar={<Avatar alt="openwebui" src={openwebui_icon as string} />}
                    label="Open Web UI"
                    variant="outlined"
                    component="a"
                    href={`${host}:8080`}
                />
                <Chip
                    style={{cursor: 'pointer'}}
                    avatar={<Avatar alt="langfuse" src={langfuse_icon as string} />}
                    label="LangFuse"
                    variant="outlined"
                    component="a"
                    href={`${host}:3000`}
                    disabled
                />
            </Stack>
        </div>
        </ModalLayout>
    );
}
export default HomePage;
