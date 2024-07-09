export default (catchErrors) => (req, res, next) => {
    Promise.resolve(catchErrors(req, res, next)).catch(next);
} 