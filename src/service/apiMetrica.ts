import { FiltroMetricaBody } from "@/types/MetricaType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerMetricasDeBajaDeEstudiantes = () => axios.get('/api/metricas/estudiantes/dadosDeBaja');
export const obtenerMetricasDeBajaDeEstudiantesDeComision = (idComision: string) => axios.get(`/api/metricas/estudiantes/dadosDeBaja/porComision/${idComision}`);
export const obtenerMetricasDeAsistenciaGlobal = () => axios.get('/api/metricas/asistencia');
export const obtenerMetricasDeAsistenciaPorComision = (idComision: string) => axios.get(`/api/metricas/asistencia/comision/${idComision}`);

//Como data, retorna un array de Objetos de Tipo DataPoint
export const obtenerMetricasDinamicas = (filtro: FiltroMetricaBody) => axios.post('/api/metricas/dinamicas', filtro);