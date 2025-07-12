export class ErrorWithStatus extends Error {
    public status: number | null = null;

    constructor(message: string, status: number) {
        super(message)
        this.status = status;
    }
}