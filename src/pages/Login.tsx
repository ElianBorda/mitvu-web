import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { login, primerLogin } from "@/service/apiAuth";
import { LoginData, Rol } from "@/types/authType";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Estados del formulario
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Estados de control de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || !password) {
      toast.error("Por favor, completá tu DNI y contraseña.");
      return;
    }

    setIsLoading(true);

    login({ dni, password })
      .then((response) => {
        const userData: LoginData = response.data;
        
        if (userData.requiereCambioPassword) {
          setIsFirstLogin(true);
          toast.info("Por seguridad, debés cambiar tu contraseña por defecto.");
        } else {
          loginUser(userData);
          toast.success(`Bienvenido, ${userData.nombre}`);
          
          if (userData.rol === Rol.ESTUDIANTE) {
            navigate(`/estudiante/${userData.id}`);
          } else if (userData.rol === Rol.TUTOR) {
            navigate(`/tutor/${userData.id}`);
          } else {
            navigate("/");
          }
        }
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 401) {
          toast.error("Credenciales incorrectas.");
        } else {
          toast.error("Error en el servidor. Intentá nuevamente más tarde.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFirstLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    primerLogin({ dni, passwordTemporal: password, passwordNueva: newPassword })
      .then(() => {
        toast.success("Contraseña actualizada con éxito. Por favor, ingresá nuevamente.");
        setIsFirstLogin(false);
        setPassword("");
        setNewPassword("");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Hubo un error al actualizar la contraseña. Intentá nuevamente.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card border border-border bg-card text-card-foreground">
        <CardHeader className="text-center space-y-1.5 p-6">
          <div className="mx-auto bg-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">TVU</span>
          </div>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
            {isFirstLogin ? "Actualizá tu contraseña" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            {isFirstLogin 
              ? "Para continuar, ingresá una contraseña segura."
              : "Ingresá con tu DNI al sistema de gestión."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          {!isFirstLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Tu número de documento"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleFirstLoginSubmit} className="space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar y continuar"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsFirstLogin(false);
                    setPassword("");
                    setNewPassword("");
                  }}
                  disabled={isLoading}
                >
                  Volver al inicio
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}