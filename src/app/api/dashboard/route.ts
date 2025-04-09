import { NextRequest, NextResponse } from 'next/server';
import { getSummaryByDate, getSummaryByRange, getComparison } from '@/lib/dashboardService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view');
  const date = searchParams.get('date');
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const date1 = searchParams.get('date1');
  const date2 = searchParams.get('date2');

  try {
    if (view === 'daily' && date) {
      const data = await getSummaryByDate(new Date(date));
      return NextResponse.json(data);
    }

    if (view === 'range' && start && end) {
      const data = await getSummaryByRange(new Date(start), new Date(end));
      return NextResponse.json(data);
    }

    if (view === 'compare' && date1 && date2) {
      const data = await getComparison(new Date(date1), new Date(date2));
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
