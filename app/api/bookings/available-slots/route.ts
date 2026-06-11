import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const igId = searchParams.get('igId');

    const url = new URL(`${process.env.EXPRESS_SERVER_URL}/api/bookings/available-slots`);
    if (igId) url.searchParams.set('igId', igId);

    const response = await fetch(url.toString(), { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
