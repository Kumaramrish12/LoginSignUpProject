import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  return true;   // allow access to all routes temporarily
};