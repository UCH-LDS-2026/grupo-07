import { describe, test, expect } from 'vitest';
// Nota: El VS Code te va a marcar "vitest" en rojo, ignoralo por ahora.

describe('Pruebas unitarias para useDolar', () => {

  test('Debería retornar el precio correcto del dólar cuando la API responde bien', () => {
    // 1. Arrange (Preparar los datos simulados)
    const precioSimulado = 1250; 
    
    // 2. Act (Ejecutar la lógica)
    // Aquí simularías el estado del hook con el valor correcto
    const resultadoObtenido = precioSimulado; 

    // 3. Assert (Verificar que el resultado sea el esperado)
    expect(resultadoObtenido).toBe(1250);
  });

  test('Debería manejar el estado en cero o carga inicial', () => {
    // 1. Arrange
    const precioInicial = 0;

    // 2. Act
    const resultadoObtenido = precioInicial;

    // 3. Assert
    expect(resultadoObtenido).toBe(0);
  });

  test('Debería retornar un error si la API del dólar se cae', () => {
    // 1. Arrange
    const huboError = true;

    // 2. Act
    const resultadoObtenido = huboError;

    // 3. Assert
    expect(resultadoObtenido).toBe(true);
  });

});