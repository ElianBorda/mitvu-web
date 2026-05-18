import { AnuncioBody } from "@/types/anuncioType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerAnunciosGlobales = () => axios.get("/api/anuncios");
export const crearAnuncioGlobal = (anuncio: AnuncioBody) => axios.post("/api/anuncios", anuncio);