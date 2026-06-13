import { useState, useEffect } from 'react';

export interface DolarData {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface UseDolarReturn {
  cotizacion: DolarData | null;
  loading: boolean;
  error: string | null;
  /** Precio de venta del dólar blue (el que se usa para convertir USD -> ARS) */
  rate: number;
}

export const FALLBACK_RATE = 1400;
export const API_URL = 'https://dolarapi.com/v1/dolares/blue';

/**
 * Función pura que realiza el fetch a la API del dólar blue.
 * Exportada por separado para poder ser testeada de forma unitaria sin React.
 * Retorna los datos del dólar o lanza un error si la API falla.
 */
export async function fetchDolarData(): Promise<DolarData> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    compra: Number(data.compra) || FALLBACK_RATE,
    venta: Number(data.venta) || FALLBACK_RATE,
    fechaActualizacion: data.fechaActualizacion || new Date().toISOString(),
  };
}

export function useDolar(): UseDolarReturn {
  const [cotizacion, setCotizacion] = useState<DolarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCotizacion = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchDolarData();
        if (!cancelled) {
          setCotizacion(data);
        }
      } catch (err: any) {
        console.error('[useDolar] Error fetching cotización:', err.message);
        if (!cancelled) {
          setError(err.message || 'Error de conexión con la API del dólar');
          // Usar fallback para que la app no se rompa
          setCotizacion({
            compra: FALLBACK_RATE,
            venta: FALLBACK_RATE,
            fechaActualizacion: new Date().toISOString(),
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCotizacion();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    cotizacion,
    loading,
    error,
    rate: cotizacion?.venta || FALLBACK_RATE,
  };
}
