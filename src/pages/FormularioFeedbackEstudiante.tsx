import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Star, MessageSquareHeart } from "lucide-react";
import { crearFormularioFeedback } from "@/service/apiFormulario";
import { 
  FormularioFeedbackBody, UtilidadEncuentro, 
  FrecuenciaEncuentro, RespuestaCerrada 
} from "@/types/formularioFeedbackType";

export default function FormularioFeedbackEstudiante() {
  const { comisionId, tutorId } = useParams<{ comisionId: string, tutorId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormularioFeedbackBody>({
    tutorId: tutorId || "",
    comisionId: comisionId || "",
    claridadYComunicacion: 0,
    disponibilidadYRespuesta: 0,
    tratoYEmpatia: 0,
    puntajeGeneralTutor: 0,
    utilidadEncuentros: "" as UtilidadEncuentro,
    frecuenciaYAsistencia: "" as FrecuenciaEncuentro,
    organizacion: "" as RespuestaCerrada,
    acompanamientoInstitucional: 0,
    recomiendaEspacio: true,
    aspectosPositivos: "",
    oportunidadesMejora: "",
    comentariosAdicionales: ""
  });

  const handleChange = (field: keyof FormularioFeedbackBody, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.claridadYComunicacion || !form.disponibilidadYRespuesta || !form.tratoYEmpatia || !form.puntajeGeneralTutor || !form.acompanamientoInstitucional) {
      toast.error("Por favor completá todas las calificaciones con estrellas.");
      return;
    }
    if (!form.utilidadEncuentros || !form.frecuenciaYAsistencia || !form.organizacion) {
      toast.error("Por favor seleccioná las opciones en las preguntas cerradas.");
      return;
    }

    setLoading(true);
    try {
      // Formateamos para asegurar que el backend reciba 'null' en lugar de un string vacío ""
      const payloadToSend = {
        ...form,
        aspectosPositivos: form.aspectosPositivos?.trim() === "" ? null : form.aspectosPositivos?.trim(),
        oportunidadesMejora: form.oportunidadesMejora?.trim() === "" ? null : form.oportunidadesMejora?.trim(),
        comentariosAdicionales: form.comentariosAdicionales?.trim() === "" ? null : form.comentariosAdicionales?.trim(),
      };

      await crearFormularioFeedback(payloadToSend);
      toast.success("¡Gracias! Tu feedback fue enviado de forma anónima.");
      navigate(-1); 
    } catch (error: any) {
      console.error("Error devuelto por el backend:", error.response?.data || error.message);
      toast.error("Hubo un error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label} *</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-all hover:scale-110 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
          >
            <Star size={24} className={star <= value ? "fill-yellow-500" : ""} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-card rounded-xl shadow-card border border-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <MessageSquareHeart size={24} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Feedback Anónimo</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Ayudanos a mejorar. Tus respuestas son 100% confidenciales y solo serán vistas por la administración.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <div className="space-y-5 bg-secondary/30 p-5 rounded-lg border border-border/50">
              <h2 className="text-base font-semibold text-primary">Sobre tu Tutor/a</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <StarRating label="Claridad y comunicación" value={form.claridadYComunicacion} onChange={(v) => handleChange('claridadYComunicacion', v)} />
                <StarRating label="Disponibilidad y respuesta" value={form.disponibilidadYRespuesta} onChange={(v) => handleChange('disponibilidadYRespuesta', v)} />
                <StarRating label="Trato y empatía" value={form.tratoYEmpatia} onChange={(v) => handleChange('tratoYEmpatia', v)} />
                <StarRating label="Puntaje general del tutor" value={form.puntajeGeneralTutor} onChange={(v) => handleChange('puntajeGeneralTutor', v)} />
              </div>
            </div>

            <div className="space-y-5 bg-secondary/30 p-5 rounded-lg border border-border/50">
              <h2 className="text-base font-semibold text-primary">Sobre los Encuentros</h2>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Utilidad de los encuentros *</label>
                <select required autoComplete="off" className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.utilidadEncuentros} onChange={e => handleChange('utilidadEncuentros', e.target.value)}>
                  <option value="" disabled>Seleccioná una opción...</option>
                  <option value={UtilidadEncuentro.MUCHO}>Fueron de mucha utilidad</option>
                  <option value={UtilidadEncuentro.BASTANTE}>Fueron bastante útiles</option>
                  <option value={UtilidadEncuentro.POCO}>Fueron de poca utilidad</option>
                  <option value={UtilidadEncuentro.NADA}>No me sirvieron</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Frecuencia y asistencia *</label>
                <select required autoComplete="off" className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.frecuenciaYAsistencia} onChange={e => handleChange('frecuenciaYAsistencia', e.target.value)}>
                  <option value="" disabled>Seleccioná una opción...</option>
                  {/* AQUÍ ESTÁ EL CAMBIO CLAVE A LAS NUEVAS CONSTANTES */}
                  <option value={FrecuenciaEncuentro.FUERON_SUFICIENTES}>La cantidad de encuentros fue la adecuada</option>
                  <option value={FrecuenciaEncuentro.FALTARON_ENCUENTROS}>Faltaron más encuentros</option>
                  <option value={FrecuenciaEncuentro.FUERON_DEMASIADOS}>Fueron demasiados encuentros</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">¿Se respetaron días y horarios pactados? *</label>
                <select required autoComplete="off" className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.organizacion} onChange={e => handleChange('organizacion', e.target.value)}>
                  <option value="" disabled>Seleccioná una opción...</option>
                  <option value={RespuestaCerrada.SI}>Sí, siempre</option>
                  <option value={RespuestaCerrada.A_VECES}>A veces</option>
                  <option value={RespuestaCerrada.NO}>No</option>
                </select>
              </div>
            </div>

            <div className="space-y-5 bg-secondary/30 p-5 rounded-lg border border-border/50">
              <h2 className="text-base font-semibold text-primary">Acompañamiento Institucional</h2>
              <StarRating label="¿Cómo evaluás el apoyo de la universidad?" value={form.acompanamientoInstitucional} onChange={(v) => handleChange('acompanamientoInstitucional', v)} />
              
              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm font-medium text-foreground">¿Recomendarías este espacio de tutoría? *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" autoComplete="off" checked={form.recomiendaEspacio} onChange={() => handleChange('recomiendaEspacio', true)} className="accent-primary" /> Sí
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" autoComplete="off" checked={!form.recomiendaEspacio} onChange={() => handleChange('recomiendaEspacio', false)} className="accent-primary" /> No
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-secondary/30 p-5 rounded-lg border border-border/50">
              <h2 className="text-base font-semibold text-primary">Comentarios (Opcional)</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Aspectos positivos</label>
                <textarea rows={2} maxLength={1000} autoComplete="off" placeholder="¿Qué fue lo mejor de las tutorías?" className="p-2.5 rounded-md border border-border bg-background text-sm resize-none" value={form.aspectosPositivos || ""} onChange={e => handleChange('aspectosPositivos', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Oportunidades de mejora</label>
                <textarea rows={2} maxLength={1000} autoComplete="off" placeholder="¿Qué cosas cambiarías?" className="p-2.5 rounded-md border border-border bg-background text-sm resize-none" value={form.oportunidadesMejora || ""} onChange={e => handleChange('oportunidadesMejora', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Comentarios adicionales</label>
                <textarea rows={3} maxLength={1500} autoComplete="off" placeholder="Algún comentario extra..." className="p-2.5 rounded-md border border-border bg-background text-sm resize-none" value={form.comentariosAdicionales || ""} onChange={e => handleChange('comentariosAdicionales', e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Enviando..." : "Enviar Feedback Anónimo"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}