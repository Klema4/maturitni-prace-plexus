'use client';

import { Badge } from '@/app/components/blog/ui';

/**
 * Props pro `TopicButton`.
 */
interface TopicButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Tlačítko/téma jako wrapper nad `Badge`.
 * @param {TopicButtonProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} TopicButton.
 */
export default function TopicButton({ label, href, onClick }: TopicButtonProps) {
  return (
    <Badge
      href={href}
      onClick={onClick}
      variant="default"
    >
      {label}
    </Badge>
  );
}
