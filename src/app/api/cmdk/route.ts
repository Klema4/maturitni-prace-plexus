import { NextResponse } from 'next/server';
import { CommandAPI } from '@/utils/cmdk/types';
import { dashboardPages } from '@/app/features/dashboard/core/dashboardNavigation';

/**
 * API koncový bod pro načítání příkazů pro command palette.
 * Čerpá ze sdílené konfigurace dashboardu (dashboardNavigation), aby odkazy odpovídaly sidebaru.
 * @returns {Promise<NextResponse>} JSON odpověď s příkazy
 */
export async function GET() {
  try {
    const commands: CommandAPI = {
      commands: dashboardPages.map((group) => ({
        id: group.id,
        heading: group.category,
        items: group.pages.map((page) => ({
          id: page.id,
          label: page.name,
          description: page.description,
          href: page.href,
        })),
      })),
    };

    return NextResponse.json(commands, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/cmdk:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst příkazy' },
      { status: 500 }
    );
  }
}
