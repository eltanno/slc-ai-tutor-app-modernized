import type {ReactNode} from "react";
import {useEffect, useState} from "react";
import {useGetLoggedInUserQuery} from "../../services/Auth.api.ts";

interface IsAdminProps {
    children?: ReactNode;
    notAuthorized?: ReactNode;
}

const IsAdmin = ({children, notAuthorized = null}: IsAdminProps) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const userQuery = useGetLoggedInUserQuery({});

    useEffect(() => {
        if(userQuery.data && userQuery.data.user){
            if(userQuery.data.user.is_staff){
                setIsAuthorized(true);
            }
        }
    }, [userQuery]);

    return isAuthorized ? children : notAuthorized;
}

export default IsAdmin;
