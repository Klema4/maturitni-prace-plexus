'use client';

import { useState, useRef } from 'react';
import { Button } from '@/app/components/blog/ui/Button';
import { Avatar } from '@/app/components/blog/ui/Avatar';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUploadFiles } from '@better-upload/client';
import { updateUserImage } from '../api/profile.api';

/**
 * Props pro `ProfileHero`.
 */
interface ProfileHeroProps {
  fullName: string;
  email: string;
  image: string | null;
}

/**
 * Hero sekce profilové stránky.
 * @param {ProfileHeroProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ProfileHero.
 */
export default function ProfileHero({
  fullName,
  email,
  image,
}: ProfileHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { upload } = useUploadFiles({
    route: 'profile',
    onUploadComplete: async (result: any) => {
      try {
        let imageUrl: string | null = null;
        
        const file = result?.files?.[0];
        const key = file?.objectKey || file?.objectInfo?.key;
        
        if (key) {
          const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
          if (endpoint) {
            const cleanEndpoint = endpoint.replace(/\/$/, '');
            imageUrl = `${cleanEndpoint}/profiles/${key}`;
          }
        } else if (file?.url) {
          imageUrl = file.url;
        } else if (result?.url) {
          imageUrl = result.url;
        }

        if (imageUrl) {
          await updateUserImage({ imageUrl });
        } else {
          setError('Nepodařilo se vygenerovat URL obrázku');
        }
      } catch {
        setError('Nepodařilo se aktualizovat obrázek');
      } finally {
        setUploading(false);
      }
    },
    onError: (error) => {
      setError(error?.message || 'Chyba při nahrávání obrázku');
      setUploading(false);
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const uploadResult = await upload([file]);
      
      if (uploadResult?.files?.[0]?.objectInfo?.key) {
        const key = uploadResult.files[0].objectInfo.key;
        const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
        if (endpoint) {
          const cleanEndpoint = endpoint.replace(/\/$/, '');
          const imageUrl = `${cleanEndpoint}/profiles/${key}`;
          await updateUserImage({ imageUrl });
          setUploading(false);
        } else {
          setError('NEXT_PUBLIC_MINIO_PUBLIC_URL není nastaven');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se nahrát obrázek');
      setUploading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-8 my-8">
      <div className='flex flex-col items-center justify-center gap-4'>
        <Image src="/doodles/PettingDoodle.svg" alt="Profile Hero" width={156} height={156} />
        <h1 className='newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark'>Vítejte zpět!</h1>
      </div>
      <div className='flex flex-col items-center justify-center gap-4'>
        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight max-w-md">
            {error}
          </div>
        )}
        <div className="relative group">
          <Avatar 
            src={image || undefined} 
            alt={fullName} 
            size="lg" 
            className='size-24 cursor-pointer' 
            variant="dark"
            onClick={handleImageClick}
          />
          <div
            role="button"
            tabIndex={0}
            aria-label="Změnit profilový obrázek"
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleImageClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick();
              }
            }}
          >
            {uploading ? (
              <Loader2 className="text-white animate-spin" size={24} />
            ) : (
              <Upload className="text-white" size={24} />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div className='text-center flex flex-col items-center justify-center'>
          <p className='newsreader text-lg lg:text-2xl xl:text-3xl text-dark font-medium tracking-tighter leading-relaxed'>{fullName}</p>
          <p className='text-md lg:text-base text-zinc-600 tracking-tight font-medium'>
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}
