import { TipItemProps } from "./types";

export function TipItem({ text }: TipItemProps) {
  return (
    <li className="flex items-start gap-1.5">
      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
      <span>{text}</span>
    </li>
  );
}