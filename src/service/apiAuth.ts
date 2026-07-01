import { LoginBody, PrimerLogueoBody } from "@/types/authType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const login = (loginBody: LoginBody) => axios.post("/api/auth/login", loginBody);
export const primerLogin = (loginBody: PrimerLogueoBody) => axios.put("/api/auth/primerLogueo", loginBody);