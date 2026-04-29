import Image from "next/image";
import { spriteUrl } from "@/lib/pokeapi";

interface Props {
  title: string;
  message?: string;
  action?: React.ReactNode;
  spriteId?: number;
}

export default function EmptyState({
  title,
  message,
  action,
  spriteId = 143,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="relative h-32 w-32 animate-bob">
        <Image
          src={spriteUrl(spriteId)}
          alt=""
          fill
          sizes="128px"
          className="object-contain"
          style={{ filter: "drop-shadow(2px 4px 0 rgba(0,0,0,0.25))" }}
          unoptimized
        />
      </div>
      <h2 className="pixel-text text-sm text-foreground">{title}</h2>
      {message ? (
        <p className="pixel-mono max-w-md text-base leading-tight text-foreground/70">
          {message}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
