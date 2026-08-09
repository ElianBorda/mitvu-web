import { AnuncioBody } from "@/types/anuncioType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerAnunciosGlobales = () => axios.get("/api/anuncios");
export const obtenerAnunciosDeComision = (comisionId: string) => axios.get(`/api/anuncios/comision/${comisionId}`);
export const crearAnuncioGlobal = (anuncio: AnuncioBody) => axios.post("/api/anuncios", anuncio);
export const crearAnuncioEnComision = (anuncio: AnuncioBody) => axios.post(`/api/anuncios/comision`, anuncio);
export const obtenerAnuncioPorId = (anuncioId: string) => axios.get(`/api/anuncios/${anuncioId}`);
export const actualizarAnuncio = (anuncioId: string, anuncio: AnuncioBody) => axios.put(`/api/anuncios/${anuncioId}`, anuncio);
export const eliminarAnuncio = (anuncioId: string) => axios.delete(`/api/anuncios/${anuncioId}`);