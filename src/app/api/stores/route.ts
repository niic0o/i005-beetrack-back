import { NextRequest } from 'next/server';
import { createStore, getAllStores } from './store.service';
import { successResponse } from '@/lib/responses';
import { handleError } from '@/lib/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const storeData = await req.json();
    // Traer userId del token ?
    const store = await createStore(storeData);
    return successResponse(store, 201);
  } catch (error) {
    handleError(error);
  }
}

export async function GET() {
  try {
    const stores = await getAllStores();
    return successResponse(stores, 200);
  } catch (error) {
    handleError(error);
  }
}
