import { useState } from "react";
import AdminDashboard from "@/pages/AdminDashboard";
import EstudianteDashboard from "@/pages/EstudianteDashboard";
import { useLayoutContext } from "@/App";

export default function Index() {
  const { role } = useLayoutContext();
  const [studentUnenrolled, setStudentUnenrolled] = useState(
      () => typeof window !== "undefined" && localStorage.getItem("studentUnenrolled") === "true"
  );

  if (role === "admin") return <AdminDashboard />;
  if (role === "tutor") return null; 
  if (role === "estudiante") return <EstudianteDashboard unenrolled={studentUnenrolled} />;
  
  return null;
}