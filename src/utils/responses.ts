interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
  }
  
  // Helper function to send a consistent response
  export function sendResponse<T>({
    message,
    data,
    success = true,
  }: {
    message?: string;
    data: T;
    success?: boolean;
  }): ApiResponse<T> {
    return {
      success,
      message,
      data,
    };
  }
  