import { Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Shredder } from "lucide-react";

export default function NoData() {
  return (
    <Paragraph
      color="default"
      size="small"
      textAlign="center"
      className="my-12 mx-auto flex flex-col justify-center items-center gap-2 max-w-md"
    >
      <Shredder size={32} className="" />
      Momentálně nejsou dostupná žádná data ke zpracování nebo zobrazení. Zkuste
      to znovu později.
    </Paragraph>
  );
}
