import { Button } from "@/app/components/blog/ui/Button";
import { ArrowUpRight, Dices } from "lucide-react";

export default function DiscoverSection() {
    return (
        <section className="px-4 lg:px-8 my-8">
            <div className='flex items-center justify-between py-4 my-4'>
                <h1 className='newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark'>Objevte články</h1>
                <div className="items-center gap-2 hidden md:flex">
                    <Button href="/articles" variant="subtle" size="md"><ArrowUpRight size={16} /> Všechny články</Button>
                    <Button href="/api/articles/random" variant="subtle" size="md"><Dices size={16} /> Náhodný článek</Button>
                </div>
            </div>
        </section>
    );
}