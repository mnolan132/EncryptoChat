import { Request } from "express";
import { File } from "multer"; // Multer's File type

// Custom request type with an optional 'file' property
export interface MulterRequest extends Request {
  file?: File;
}
