import { ComisionBody } from "@/types/comisionType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const postCrearComision = (comision: ComisionBody) => axios.post('/api/comisiones', comision);
export const deleteComision = (id: string) => axios.delete(`/api/comisiones/${id}`);
export const getObtenerComision = (id: string) => axios.get(`/api/comisiones/${id}`);
export const putModificarComision = (id: string, comision: ComisionBody) => axios.put(`/api/comisiones/${id}`, comision);