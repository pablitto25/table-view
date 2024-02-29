
export const fetchDataVtexProducts = async () => {
    const endpoint = `https://correct-earwig-45.hasura.app/api/rest/c-bu-get`;
    const adminSecret = process.env.NEXT_PUBLIC_HASURA_KEY;
  
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-hasura-admin-secret': `${adminSecret}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      // Manejar errores aquí
      console.error('Error al realizar la solicitud:', error);
      throw error;
    }
  };