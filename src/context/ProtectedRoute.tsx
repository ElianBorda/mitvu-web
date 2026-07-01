import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Rol } from "@/types/authType";

type ProtectedRouteProps = {
  allowedRoles?: Rol[];
  children?: React.ReactNode; // Agregamos soporte para hijos
};

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    if (user.rol === Rol.ESTUDIANTE) {
      return <Navigate to={`/estudiante/${user.id}`} replace />;
    }
    if (user.rol === Rol.TUTOR) {
      return <Navigate to={`/tutor/${user.id}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}