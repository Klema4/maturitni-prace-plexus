import { Button } from '@/app/components/blog/ui/Button';
import { Card } from '@/app/components/blog/ui/Card';
import { headers } from "next/headers";
import ProfileHero from './components/ProfileHero';
import FavoriteTagsCard from './components/FavoriteTagsCard';
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/userService";

/**
 * Profilová stránka uživatele (server component)
 * Na serveru načte session + uživatele a vykreslí hero + oblíbené štítky.
 */
export default async function ProfilePage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const userData = session?.user?.id ? await getCurrentUser(session.user.id) : null;

  if (!userData) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-dark">Nejste přihlášeni</h2>
          <p className="text-zinc-600 tracking-tight mb-6">Pro zobrazení profilu se prosím přihlaste.</p>
          <Button href="/account/auth/log-in" variant="primary">Přihlásit se</Button>
        </Card>
      </div>
    );
  }

  const fullName = `${userData.name}${userData.surname ? ` ${userData.surname}` : ""}`.trim();

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <ProfileHero
        fullName={fullName}
        email={userData.email}
        image={userData.image}
      />

      {/* Hlavní obsah */}
      <div className="max-w-4xl mx-auto flex flex-col gap-8 my-8 mt-24">
        <h1 className='newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark'>Profil</h1>
        <FavoriteTagsCard />
      </div>
    </div>
  );
}
