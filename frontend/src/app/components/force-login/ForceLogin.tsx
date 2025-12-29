import type {ReactNode} from "react";
import {useEffect, useRef, useState} from "react";
import {useRefreshTokenMutation} from "../../services/Auth.api.ts";
import {Navigate, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import usePreferences from "../../utils/usePreferences.ts";

interface ForceLoginProps {
    children: ReactNode;
}

const ForceLogin = ({children}: ForceLoginProps) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [getNewAccessToken] = useRefreshTokenMutation();
    const checkPerformed = useRef(false);
    const navigate = useNavigate();
    const { apiToken, refreshToken, setApiToken, setRefreshToken } = usePreferences();

    const forceLogout = () => {
        setApiToken();
        setRefreshToken();
        setIsAuthorized(false);
        navigate('/login');
    }

    const checkAccessToken = async () => {
        if(!apiToken){
            forceLogout();
            return;
        }
        const decoded = jwtDecode(apiToken);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if(tokenExpiration){
            if(tokenExpiration < now){
                try{
                    const response = await getNewAccessToken(refreshToken)

                    if(response.error){
                        forceLogout();
                        return;
                    }

                    if(response && response.data && response.data.access){
                        setApiToken(response.data.access);
                        setIsAuthorized(true);
                    }else{
                        forceLogout();
                    }
                }catch(e){
                    console.error("Error refreshing token:", e);
                    forceLogout();
                }
            }else{
                setIsAuthorized(true);
            }
        }else{
            forceLogout();
        }
    }

    useEffect(() => {
        const asyncCheckAuth = async () => {
            if(checkPerformed.current) return;

            try{
                checkPerformed.current = true;
                await checkAccessToken();
            }catch(e){
                console.error("Error during auth check:", e);
                forceLogout();
            }
        };

        asyncCheckAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount
    }, []);

    if(isAuthorized === null){
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ForceLogin;
