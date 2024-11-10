import { Rect } from "react-konva";

export default function Direction({
  direction,
}: {
  direction: "north" | "south" | "east" | "west";
}) {
  return (
    <Rect
      width={256}
      height={8}
      x={direction === "east" ? 256 : direction === "west" ? 8 : 0}
      y={direction == "south" ? 248 : 0}
      rotation={direction === "east" || direction === "west" ? 90 : 0}
      fill="#0000FF"
    />
  );
}
