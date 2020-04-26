import { User } from '../models/users'
import { Request } from 'express'

export interface AuthedReq extends Request {
  user: User | null
}

export interface ReqAuthedReq extends AuthedReq {
  user: User
}
