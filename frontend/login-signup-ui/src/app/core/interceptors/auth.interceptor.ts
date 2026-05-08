import {
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor:
HttpInterceptorFn = (req, next) => {

  // ✅ GET TOKEN
  const token =
    sessionStorage.getItem('token');

  // ✅ IF TOKEN EXISTS
  if (token) {

    req = req.clone({

      setHeaders: {

        Authorization:
          `Bearer ${token}`

      }

    });

  }

  // ✅ CONTINUE REQUEST
  return next(req);
};