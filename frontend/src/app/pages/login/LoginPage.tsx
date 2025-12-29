import * as React from 'react'
import {useLoginMutation} from "../../services/Auth.api.ts";
import {useNavigate} from "react-router-dom";
import type {FormikHelpers} from "formik";
import {Field, Form, Formik} from "formik";
import {Box, Button, Typography} from "@mui/material";
import {TextField} from "formik-mui";
import ModalLayout from "../../layout/ModalLayout.tsx";
import usePreferences from "../../utils/usePreferences.ts";
import {useEffect} from "react";
import { APP_ROUTES } from '../../../constants.ts';
import type { ApiError } from '../../types/Error.ts';

interface FormValues {
    email: string;
    password: string;
}

const LoginPage = (): React.ReactNode => {
    const [errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();
    const [login] = useLoginMutation();
    const { apiToken, refreshToken, setApiToken, setRefreshToken } = usePreferences();

    useEffect(() => {
        if(apiToken && refreshToken){ //Logged in
            navigate(APP_ROUTES.DASHBOARD);
        }
    }, [apiToken, refreshToken, navigate]);

    const validateForm = (values: FormValues) => {
        const errors: Partial<FormValues> = {};
        if (!values.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            errors.email = "Email address is invalid";
        }
        if (!values.password) {
            errors.password = "Password is required";
        } else if (values.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        return errors;
    };

    const onSubmitForm = async (values: FormValues, {setSubmitting}: FormikHelpers<FormValues>) => {
        try{
            await setApiToken();
            await setRefreshToken();

            const username = values.email.toLowerCase();
            const password = values.password;
            const response = await login({username, password});

            if(response.data && response.data.access){
                await setApiToken(response.data.access);
                await setRefreshToken(response.data.refresh);
                navigate(APP_ROUTES.DASHBOARD);
            }else if(response.error){
                const error = response.error as ApiError;
                setErrorMessage(error.data.detail);
            }
        }catch (e) {
            const error = e as ApiError;
            setErrorMessage(error.data.detail)
        }
        setSubmitting(false);
    }

    return (
        <ModalLayout>
            <Typography variant="h4">
                Sign in
            </Typography>
            <Typography variant="body1">
                This app is for demo and testing purposes only. Please contact SLC if you need access.
            </Typography>

            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validate={validateForm}
                onSubmit={onSubmitForm}
            >
                {({ submitForm, isSubmitting}) => (
                    <Form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
                        <Box sx={{ mt: 1 }}>
                            <Field
                                component={TextField}
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <Field
                                component={TextField}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />

                            {errorMessage !== "" && (
                                <Typography variant="body1" color="error" gutterBottom>{errorMessage}</Typography>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                loading={isSubmitting}
                            >
                                Sign In
                            </Button>

                        </Box>
                    </Form>
                )}
            </Formik>
        </ModalLayout>
    );
}
export default LoginPage;
