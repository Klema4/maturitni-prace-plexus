import Navbar from "@/app/components/blog/Navbar";
import Footer from "@/app/components/blog/Footer";
import Loading from "@/app/(main)/loading";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <Navbar />
      <main className="max-w-screen-2xl mx-auto">
        {children}
      </main>
      <Footer />
    </Suspense>
  );
}