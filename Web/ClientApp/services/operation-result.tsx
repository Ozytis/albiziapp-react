export class OperationResult<T> {

    public errors: string[];

    public data: T;

    public success: boolean;

    constructor(success: boolean, errors?: string[], data?: T) {
        this.errors = errors;
        this.data = data;
        this.success = success;
    }
}