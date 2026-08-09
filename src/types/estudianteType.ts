export type EstudianteBody = {
    nombre: string,
    apellido: string,
    dni: string,
    mail: string,
    carrera: string,
    comision_id: string | null
}

export type Estudiante = {
    id: string,
    nombre: string,
    apellido: string,
    mail: string,
    carrera: string,
    comision_id: string
}