import { useState, useEffect } from "react";
import { UserCheck, CheckCircle, XCircle, Search, FileText, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { SolicitudTutor, EstadoAcademico, EstadoDiplomatura } from "@/types/solicitudTutorType";
import { obtenerSolicitudesPendientes, aprobarSolicitudDeTutor, rechazarSolicitudDeTutor } from "@/service/apiSolicitudTutor";

export default function AdminSolicitudesDashboard() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudTutor | null>(null);

  const fetchSolicitudes = () => {
    setLoading(true);
    // PROMESA PURA (Sin async/await)
    obtenerSolicitudesPendientes()
      .then((res) => {
        setSolicitudes(res.data || []);
      })
      .catch(() => {
        toast.error("Error al cargar las solicitudes pendientes");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleAprobar = (id: string) => {
    toast("Aprobando solicitud...");
    aprobarSolicitudDeTutor(id)
      .then(() => {
        toast.success("Solicitud aprobada. El tutor fue dado de alta en el sistema.");
        setSelectedSolicitud(null);
        fetchSolicitudes();
      })
      .catch(() => {
        toast.error("Error al intentar aprobar la solicitud.");
      });
  };

  const handleRechazar = (id: string) => {
    toast("Rechazando solicitud...");
    rechazarSolicitudDeTutor(id)
      .then(() => {
        toast.success("Solicitud rechazada correctamente.");
        setSelectedSolicitud(null);
        fetchSolicitudes();
      })
      .catch(() => {
        toast.error("Error al intentar rechazar la solicitud.");
      });
  };

  const filteredData = solicitudes.filter(s => 
    `${s.nombre} ${s.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.dni.includes(searchTerm)
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="text-primary" />
            Solicitudes de Tutores
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Revisá y validá los perfiles de los nuevos postulantes.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Buscar postulante o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Grid de Cards */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando solicitudes...</div>
      ) : filteredData.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center rounded-xl shadow-sm text-muted-foreground">
          No hay solicitudes pendientes en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map(s => (
            <div key={s.id} className="bg-card border border-border p-5 rounded-xl shadow-card flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{s.nombre} {s.apellido}</h3>
                  <p className="text-xs text-muted-foreground">DNI: {s.dni} • Postulado el {s.fechaPostulacion?.substring(0,10)}</p>
                </div>
                <div className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  PENDIENTE
                </div>
              </div>
              
              <div className="w-full h-px bg-border/50" />
              
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <GraduationCap size={16} className="text-muted-foreground shrink-0"/>
                  <span className="truncate">{s.carrera}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Briefcase size={16} className="text-muted-foreground shrink-0"/>
                  <span>{s.estadoAcademico === EstadoAcademico.EGRESADO ? "Egresado" : "Estudiante Avanzado"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <FileText size={16} className="text-muted-foreground shrink-0"/>
                  <span className="truncate">
                    {s.estadoDiplomatura === EstadoDiplomatura.REALIZADA ? "Diplomatura Completa" : 
                     s.estadoDiplomatura === EstadoDiplomatura.CURSANDO ? "Diplomatura en Curso" : "Sin Diplomatura"}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSolicitud(s)}
                className="mt-auto w-full py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Revisar Perfil Completo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE LA SOLICITUD */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            <div className="p-6 border-b border-border bg-secondary/30 rounded-t-2xl">
              <h2 className="text-xl font-bold text-foreground">{selectedSolicitud.nombre} {selectedSolicitud.apellido}</h2>
              <p className="text-sm text-muted-foreground">{selectedSolicitud.correo} | DNI: {selectedSolicitud.dni}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/20 p-3 rounded-lg border border-border">
                  <span className="block text-xs text-muted-foreground uppercase mb-1">Carrera</span>
                  <span className="font-medium text-sm">{selectedSolicitud.carrera}</span>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg border border-border">
                  <span className="block text-xs text-muted-foreground uppercase mb-1">Estado Académico</span>
                  <span className="font-medium text-sm">
                    {selectedSolicitud.estadoAcademico === EstadoAcademico.EGRESADO ? "Egresado" : "Estudiante Avanzado"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-bold text-foreground">Experiencia y Requisitos</h3>
                
                <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Estado Diplomatura TVU</span>
                  <span className={`font-semibold ${selectedSolicitud.estadoDiplomatura === EstadoDiplomatura.REALIZADA ? "text-green-600" : selectedSolicitud.estadoDiplomatura === EstadoDiplomatura.NO_REALIZADA ? "text-red-500" : "text-yellow-600"}`}>
                    {selectedSolicitud.estadoDiplomatura.replace("_", " ")}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Experiencia como egresado</span>
                  <span className="font-semibold">{selectedSolicitud.experienciaComoEgresado ? "Sí" : "No"}</span>
                </div>

                <div className="flex justify-between items-center text-sm pb-2">
                  <span className="text-muted-foreground">Fue tutor anteriormente</span>
                  <span className="font-semibold">{selectedSolicitud.fueTutorAnteriormente ? "Sí" : "No"}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button 
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cerrar
                </button>
                <div className="flex-1 flex justify-end gap-3">
                  <button 
                    onClick={() => handleRechazar(selectedSolicitud.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                  <button 
                    onClick={() => handleAprobar(selectedSolicitud.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors shadow-md"
                  >
                    <CheckCircle size={16} /> Aprobar como Tutor
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}