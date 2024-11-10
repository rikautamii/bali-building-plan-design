import { type ClassValue, clsx } from "clsx";
import Konva from "konva";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCoordinate(e: Konva.KonvaEventObject<MouseEvent>) {
  const x = e.target.getStage()?.getRelativePointerPosition()?.x;
  const y = e.target.getStage()?.getRelativePointerPosition()?.y;

  return { x, y };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
