export interface lista{
   id:number;
   nomServicio:string;
}
export interface userInfo{
   id?:string;
   name: string;
   grupo:number;
   sexo:string;
   fechaCita:string ;
   hora:string;
}
export interface sexo{
   id: number;
   genero:string;
}
export interface hora{
   id:number;
   horaC:string;
}

export interface UsuarioIngresar {
  nombre: string;
  username: string;
  email: string;
  password: string;
  userType?: 'usuario' | 'administrador';
  adminKey?: string;
  lowercaseUsername?: string;
}