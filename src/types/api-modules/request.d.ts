declare namespace Api {
  namespace Request {
    interface Result<T = any> {
      code: number;
      type: 'success' | 'error' | 'warning';
      message: string;
      result: T;
    }
  }
}
