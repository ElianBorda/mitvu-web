import { FormularioFeedbackBody } from "@/types/formularioFeedbackType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const crearFormularioFeedback = (formularioFeedback: FormularioFeedbackBody) => axios.post('/api/feedbacks', formularioFeedback)
export const obtenerTodosLosFormularioFeedback = () => axios.get('/api/feedbacks')