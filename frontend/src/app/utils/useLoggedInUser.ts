import {useGetLoggedInUserQuery} from "../services/Auth.api.ts";
import {useEffect, useState} from "react";
import type {UserData} from "../types/User.ts";

const useLoggedInUser = () => {
    const userQuery = useGetLoggedInUserQuery({});
    const [user, setUser] = useState<UserData>();

    useEffect(() => {
        if(userQuery.data && userQuery.data.user){
            setUser(userQuery.data.user);
        }
    }, [userQuery]);

    return {user, loading: userQuery.isLoading, error: userQuery.isError}
}

export default useLoggedInUser;
