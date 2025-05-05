import { AppRouter, initContract } from '@ts-rest/core';
import { productContract } from '@/features/products/product.contract';
import { orderContract } from '@/features/orders/order.contract';
import { authContract } from '@/features/auth/auth.contract';
import { dashboardContract } from '@/features/dashboard/dashboard.contract';
import { generateOpenApi } from '@ts-rest/open-api';

// Creación de nuevo tipo para utilizar la variable 'requiresAuth' en metadata
type AppRouteWithRequiresAuth = Omit<AppRouter, 'metadata'> & {
  metadata?: {
    requiresAuth?: boolean;
  };
};

export const c = initContract();

export const contract = c.router({
  auth: authContract,
  products: productContract,
  orders: orderContract,
  dashboard: dashboardContract,
});

export const openApiDocument = generateOpenApi(contract, {
  info: {
    title: 'Beetrack API',
    version: '1.0.0',
  },
  openApiObjectOverrides: {
    components: {
      securitySchemes: {
        jwtCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  operationMapper: (
    operation: Record<string, any>,
    appRoute: AppRouteWithRequiresAuth
  ): Record<string, any> => {
    const requiresAuth = appRoute.metadata?.requiresAuth;
    return {
      ...operation,
      ...(requiresAuth && {
        security: [{ jwtCookieAuth: [] }],
      }),
    };
  },
});
