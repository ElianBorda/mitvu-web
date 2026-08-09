import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerTodosLosAdministradores = () => axios.get("/api/administradores");
export const obtenerAdministrador = (id: string) => axios.get(`/api/administradores/${id}`);