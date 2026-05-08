#### Universidad Champagnat - Laboratorio de Desarrollo de Software - 2026

# Proyecto Final
## Grupo N° 7

## Integrantes:
- Jeremias Sosa
- Ivan Bustos
- Emmanuel Bustos
- Damian Lombardo

## Problema que resuelve
Los freelancers y pequeñas agencias de desarrollo carecen de una herramienta centralizada que les permita gestionar simultáneamente sus proyectos, clientes y finanzas con visibilidad en tiempo real. Las soluciones existentes son genéricas, fragmentadas y no contemplan las necesidades específicas del trabajo técnico: seguimiento de stacks, repositorios, deadlines críticos y flujo de caja multimoneda. NEXUSSGE resuelve esto integrando todas esas dimensiones en un único sistema operativo de negocios.
## Usuarios

Quién utilizará el sistema.

Freelancers de desarrollo de software y operadores de pequeñas agencias digitales que necesitan administrar múltiples proyectos, clientes y recursos financieros desde un único panel de control centralizado.
- Gestión completa del ciclo de vida de proyectos (Pipeline): desde Backlog hasta Mantenimiento, con seguimiento técnico de stack, repositorios Git y documentación.
- CRM de clientes con historial de facturación, estado de pagos y rentabilidad por proyecto.
- Dashboard analítico con métricas en tiempo real, soporte multimoneda (USD/ARS) y pronósticos de ingresos.
- Smart Deadlines: motor de detección de proyectos en riesgo con sugerencias de recuperación automáticas.
- Módulo financiero con control de gastos operativos y flujo de caja.

Frontend: React con TypeScript y Vite
Estilos: Tailwind CSS con configuración personalizada (Glassmorphism, tipografías Outfit y Space Mono)
Base de datos / Backend: Supabase (PostgreSQL, autenticación y API en tiempo real)

## Cómo ejecutar el proyecto

Instrucciones
# Clonar el repositorio
git clone https://github.com/chinobustosdev/nexusssg.git

# Instalar dependencias
cd nexussge
npm install

# Configurar variables de entorno
cp .env.example .env
# Completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# Iniciar servidor de desarrollo
npm run dev
