'use client';

import { Avatar } from '@/app/components/blog/ui';

/**
 * Props pro `TestimonialSection`.
 */
interface TestimonialSectionProps {
  quote: string;
  authorName: string;
  authorTitle?: string;
  authorAvatar?: string;
}

/**
 * Sekce s citátem a autorem.
 * @param {TestimonialSectionProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} TestimonialSection.
 */
export default function TestimonialSection({
  quote,
  authorName,
  authorTitle,
  authorAvatar,
}: TestimonialSectionProps) {
  return (
    <div className='px-4 md:px-8 py-4'>
      <section className="bg-primary text-white py-4 lg:py-8 xl:py-12 rounded-xl">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter leading-relaxed mb-8">
              "{quote}"
            </blockquote>
            <div className="flex items-center gap-4">
              {authorAvatar && (
                <Avatar src={authorAvatar} alt={authorName} size="lg" variant="dark" />
              )}
              <div>
                <div className="font-bold text-lg tracking-tight">{authorName}</div>
                {authorTitle && (
                  <div className="text-zinc-200 font-medium tracking-tight text-sm">{authorTitle}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
