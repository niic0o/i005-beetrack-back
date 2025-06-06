'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { openApiDocument } from '@/lib/contract';

export default function OpenApiDocsPage() {
  return <SwaggerUI spec={openApiDocument} displayOperationId={true} />;
}
