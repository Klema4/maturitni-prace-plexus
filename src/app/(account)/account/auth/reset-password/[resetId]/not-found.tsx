import { AuthLayout } from '@/app/features/blog/auth/components/AuthLayout';
import { AuthHeader } from '@/app/features/blog/auth/components/AuthHeader';
import Link from 'next/link';

/**
 * Not found stránka pro reset hesla s tokenem
 */
export default function NotFound() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Token není platný" 
          description="Odkaz pro reset hesla není platný nebo vypršel." 
        />
        <div className="text-center">
          <Link href="/account/auth/log-in" className="text-primary hover:underline tracking-tight font-medium">
            ← Zpět na přihlášení
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
