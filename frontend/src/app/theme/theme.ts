import {createTheme} from "@mui/material";
import {blue, red} from "@mui/material/colors";

import './index.css'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme({
    cssVariables: true,
    components: {},
    palette: {
        mode: 'light',
        primary: {
            main: blue[500],
        },
        secondary: {
            main: '#d6bdff',
        },
        error: {
            main: red.A400,
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

export default theme;
