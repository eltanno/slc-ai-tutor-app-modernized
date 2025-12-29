export interface UserCredentials{
    username: string;
    password: string;
}

export interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    chat_count?: number;
}
