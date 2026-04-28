interface Context {
    // Define the properties of the context object here
}

interface NextFunction {
    (): Promise<any>;
}

const ErrorMiddleware = async (context: Context, next: NextFunction) => {
    try {
        return await next();
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Unexpected error",
        };
    }
};

  export default ErrorMiddleware;