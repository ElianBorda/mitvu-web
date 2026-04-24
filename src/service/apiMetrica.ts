import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerMetricasDeBajaDeEstudiantes = () => axios.get('/api/metricas/estudiantes/dadosDeBaja');
export const obtenerMetricasDeBajaDeEstudiantesDeComision = (idComision: string) => axios.get(`/api/metricas/estudiantes/dadosDeBaja/porComision/${idComision}`);