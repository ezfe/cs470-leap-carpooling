import { User } from '../models/users'
import { Request } from 'express';

export interface AuthedReq extends Request {
  user?: User
}