
import { useCallback } from 'react';

export const useExport = (addEvent) => {
  const downloadExcel = useCallback(async (filtros = {}) => {
    try {
      
      const params = new URLSearchParams();
      if (filtros.startDate) params.append('startDate', filtros.startDate);
      if (filtros.endDate) params.append('endDate', filtros.endDate);
      if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);

      const url = `http://localhost:3000/api/export/excel?${params.toString()}`;
            
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('El archivo Excel está vacío');
        }
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        let fileName = 'asistencia';
        if (filtros.startDate) fileName += `_${filtros.startDate}`;
        if (filtros.endDate) fileName += `_a_${filtros.endDate}`;
        if (filtros.usuarioId) {
          fileName += `_usuario_${filtros.usuarioId}`;
        }
        fileName += '.xlsx';
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        addEvent('success', `✅ Excel descargado: ${fileName}`);
      } else {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('💥 Error descargando Excel:', error);
      addEvent('error', `❌ Error descargando Excel: ${error.message}`);
    }
  }, [addEvent]);

  return {
    downloadExcel
  };
};