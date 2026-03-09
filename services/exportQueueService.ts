// Export Queue Service
// This service manages the export queue functionality

import { getAPIURL } from '../utils/apiUrl';

interface ExportQueueItem {
  exportType: string;
  fileName: string;
  fileFormat: string;
  masterFilters: any;
  detailedFilters: any;
  selectedColumns: string[];
  includeHeaders: boolean;
}

class ExportQueueService {
  private static instance: ExportQueueService;
  private addToQueueCallback: ((item: ExportQueueItem) => Promise<number | null>) | null = null;

  static getInstance(): ExportQueueService {
    if (!ExportQueueService.instance) {
      ExportQueueService.instance = new ExportQueueService();
    }
    return ExportQueueService.instance;
  }

  // Register the callback function from ImportData component
  registerAddToQueueCallback(callback: (item: ExportQueueItem) => Promise<number | null>) {
    this.addToQueueCallback = callback;
  }

  // Add export to queue - Direct API call if callback not available
  async addToExportQueue(item: ExportQueueItem): Promise<number | null> {
    if (this.addToQueueCallback) {
      return await this.addToQueueCallback(item);
    }
    
    // Fallback: Direct API call
    console.log('Export queue callback not registered, using direct API call');
    return await this.createExportRecordDirect(item);
  }

  // Direct API call to create export record
  private async createExportRecordDirect(item: ExportQueueItem): Promise<number | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No auth token found');
        return null;
      }

      const requestBody = {
        exportType: item.exportType,
        fileName: item.fileName,
        fileFormat: item.fileFormat,
        masterFilters: item.masterFilters,
        detailedFilters: item.detailedFilters,
        selectedColumns: item.selectedColumns,
        includeHeaders: item.includeHeaders
      };

      const apiUrl = getAPIURL('/export-history');
      console.log('📤 Creating export record:', {
        exportType: item.exportType,
        fileName: item.fileName,
        fileFormat: item.fileFormat,
        url: apiUrl,
        requestBody: requestBody
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 HTTP Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('❌ Failed to create export record:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          errorText: errorText
        });
        return null;
      }

      // Read response body once
      const responseText = await response.text();
      console.log('📋 Raw response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', {
          responseText,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        });
        return null;
      }
      
      console.log('✅ Export record created successfully:', result);
      console.log('📋 Full response details:', {
        success: result.success,
        exportId: result.exportId,
        id: result.id,
        insertId: result.insertId,
        message: result.message,
        fullResult: result
      });
      
      // Backend returns exportId, but also check for id or insertId for compatibility
      if (result.exportId !== undefined && result.exportId !== null) {
        // Check if exportId is a valid number (not 0, which might indicate an issue)
        if (result.exportId > 0) {
          return result.exportId;
        } else {
          console.warn('⚠️ Export ID is 0 or invalid:', result.exportId);
        }
      }
      if (result.id !== undefined && result.id !== null && result.id > 0) {
        return result.id;
      }
      if (result.insertId !== undefined && result.insertId !== null && result.insertId > 0) {
        return result.insertId;
      }
      
      console.warn('⚠️ Export record created but no valid ID found in response:', result);
      // Even if ID is missing, if success is true, we should still return something
      // This might indicate the record was created but insertId wasn't returned
      if (result.success) {
        console.warn('⚠️ Response indicates success but no ID - this might be a backend issue');
      }
      return null;
      
    } catch (error) {
      console.error('❌ Error creating export record:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      return null;
    }
  }

  // Helper method to add export from dataset1 module
  async addDataset1Export(
    fileName: string,
    fileFormat: string,
    masterFilters: any,
    detailedFilters: any,
    selectedColumns: string[],
    includeHeaders: boolean = true
  ): Promise<number | null> {
    return this.addToExportQueue({
      exportType: 'dataset1',
      fileName,
      fileFormat,
      masterFilters,
      detailedFilters,
      selectedColumns,
      includeHeaders
    });
  }
}

export default ExportQueueService.getInstance();
