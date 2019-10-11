import { createContext } from "react";

export interface AuthContextInterface {
    token: any,
    error: string,
    loading: boolean,
    login: (username: string, password: string) => void
}

const authContext = createContext<AuthContextInterface | null>(null);

export default authContext;
