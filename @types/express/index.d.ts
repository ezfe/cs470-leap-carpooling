import { User } from '../../src/models/users'

declare module "express" {
  export interface Request {
    user?: User
  }
}