import { Request } from 'express';

export interface UserRequest extends Request {
    userId?: number;
    userType?: string;
}
