import {CssBaseline, ThemeProvider} from "@mui/material";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import AppRoutes from "./Routes.tsx";

import store from './store/store'
import theme from './theme/theme'

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppRoutes />
                </ThemeProvider>
            </BrowserRouter>
        </Provider>
    )
}

export default App
