-- Script para añadir columnas de redes sociales a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_user text,
ADD COLUMN IF NOT EXISTS linkedin_user text;
