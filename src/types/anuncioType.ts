export type Anuncio = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaDeCreacion: string;
  creadoPorId: string;
}

export type AnuncioBody = {
  titulo: string;
  descripcion: string;
  creadoPorId: string;
}
