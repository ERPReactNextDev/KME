import { NextResponse } from 'next/server';
import { deleteOldCancelledBookings } from '@/lib/deleteOldCancelled';

export async function GET() {
  try {
    const deletedCount = await deleteOldCancelledBookings();
    console.log(`Vercel Cron: Deleted ${deletedCount} cancelled bookings older than 1 day.`);
    return NextResponse.json({ message: `Deleted ${deletedCount} cancelled bookings older than 1 day.` });
  } catch (error) {
    console.error('Vercel Cron failed:', error);
    return NextResponse.json({ error: 'Failed to delete old cancelled bookings' }, { status: 500 });
  }
}
