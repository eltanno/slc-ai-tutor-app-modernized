import {Box, Container} from "@mui/material";
import {Outlet} from "react-router-dom";
import type {ReactNode} from "react";


const ModalLayout = ({children}: { children: ReactNode }) => {
    return (
        <Box sx={{ width: '100%', alignItems: "center", }}>
            <Container component="main" maxWidth="sm">
                <Box
                    sx={{
                        boxShadow: 3,
                        borderRadius: 2,
                        px: 4,
                        py: 6,
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {children}
                    <Outlet/>
                </Box>
            </Container>
        </Box>
    );
};

export default ModalLayout;
