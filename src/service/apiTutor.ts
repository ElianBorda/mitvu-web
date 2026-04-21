import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerTodosLosTutores = () => axios.get('/api/tutores');
export const obtenerTutorDeLaComision = (id: string) => axios.get(`/api/tutores/comision/${id}`);