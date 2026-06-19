import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchDolarData, FALLBACK_RATE, API_URL } from '../src/hooks/useDolar';


beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Pruebas unitarias para useDolar (fetchDolarData)', () => {

  test('La URL de la API debe apuntar al endpoint correcto del dólar blue', () => {

    const URL_CORRECTA = 'https://dolarapi.com/v1/dolares/blue';
    expect(API_URL).toBe(URL_CORRECTA);
  });

  test('Debería retornar el precio correcto del dólar cuando la API responde bien', async () => {
    
    const dataMock = {
      compra: 1230,
      venta: 1250,
      fechaActualizacion: '2025-06-12T10:00:00.000Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataMock,
    }));


    const resultado = await fetchDolarData();

   
    expect(resultado.venta).toBe(1250);
    expect(resultado.compra).toBe(1230);
    expect(resultado.fechaActualizacion).toBe('2025-06-12T10:00:00.000Z');
  });

  test('Debería usar el FALLBACK_RATE si la API devuelve valores nulos/cero', async () => {
   
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ compra: 0, venta: 0, fechaActualizacion: null }),
    }));

  
    const resultado = await fetchDolarData();

    
    expect(resultado.venta).toBe(FALLBACK_RATE);
    expect(resultado.compra).toBe(FALLBACK_RATE);
  });

  test('Debería lanzar un error si la API del dólar se cae (URL rota o status 404)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(fetchDolarData()).rejects.toThrow('HTTP 404: Not Found');
  });

  test('Debería lanzar un error si fetch falla completamente (sin conexión)', async () => {

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')));

    await expect(fetchDolarData()).rejects.toThrow('Network Error');
  });

});