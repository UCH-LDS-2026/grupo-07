-- Script para añadir columna de instagram a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_user text;
