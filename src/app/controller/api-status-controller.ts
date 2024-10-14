import { Request, Response } from "express";

class ApiStatusController {
  public health(req: Request, res: Response) {
    return res.json({
      response: "API Online",
    });
  }
}

export const apiStatusController = new ApiStatusController();
