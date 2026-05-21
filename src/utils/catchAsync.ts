import type {NextFunction,Request,Response} from "express";

// A utility function to catch errors in async functions and pass them to the next middleware (error handler)

const catchAsync = (fn: ( req: Request, res: Response, next: NextFunction) => Promise<void>) => {

  return ( req: Request, res: Response, next: NextFunction) => {

    //this send the error to the next middeleware and handle globalerror
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);

  };

};

export default catchAsync;