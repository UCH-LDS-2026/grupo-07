import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchDolarData, FALLBACK_RATE, API_URL } from '../src/hooks/useDolar';

// Reseteamos el mock de fetch antes de cada test para que no se contaminen
beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Pruebas unitarias para useDolar (fetchDolarData)', () => {

  test('La URL de la API debe apuntar al endpoint correcto del dólar blue', () => {
    // Si alguien rompe la URL (ej: agrega una "r" al final), este test falla
    const URL_CORRECTA = 'https://dolarapi.com/v1/dolares/blue';
    expect(API_URL).toBe(URL_CORRECTA);
  });

  test('Debería retornar el precio correcto del dólar cuando la API responde bien', async () => {
    // 1. Arrange: simulamos una respuesta exitosa de la API
    const dataMock = {
      compra: 1230,
      venta: 1250,
      fechaActualizacion: '2025-06-12T10:00:00.000Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataMock,
    }));

    // 2. Act: llamamos la función real del hook
    const resultado = await fetchDolarData();

    // 3. Assert: verificamos que los datos recibidos sean los esperados
    expect(resultado.venta).toBe(1250);
    expect(resultado.compra).toBe(1230);
    expect(resultado.fechaActualizacion).toBe('2025-06-12T10:00:00.000Z');
  });

  test('Debería usar el FALLBACK_RATE si la API devuelve valores nulos/cero', async () => {
    // 1. Arrange: la API responde OK pero los valores son 0 (inválidos)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ compra: 0, venta: 0, fechaActualizacion: null }),
    }));

    // 2. Act
    const resultado = await fetchDolarData();

    // 3. Assert: debe usar el valor de fallback definido en el módulo
    expect(resultado.venta).toBe(FALLBACK_RATE);
    expect(resultado.compra).toBe(FALLBACK_RATE);
  });

  test('Debería lanzar un error si la API del dólar se cae (URL rota o status 404)', async () => {
    // 1. Arrange: la API devuelve un status de error (simula URL rota o server caído)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    // 2. Act + Assert: verificamos que la función lanza un error correctamente
    await expect(fetchDolarData()).rejects.toThrow('HTTP 404: Not Found');
  });

  test('Debería lanzar un error si fetch falla completamente (sin conexión)', async () => {
    // 1. Arrange: fetch rechaza la promesa (sin red)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')));

    // 2. Act + Assert
    await expect(fetchDolarData()).rejects.toThrow('Network Error');
  });

});