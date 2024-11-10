import { getCoordinate } from "@/lib/utils";
import Konva from "konva";
import React, { useEffect } from "react";
import { Circle, Image, Layer, Line, Stage, Text } from "react-konva";
import Tool from "./tool";
import { MinusIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";

const SCALE_BY = 1.1;

export default function Output({
  image,
  footLength,
}: {
  image?: Konva.ImageConfig;
  footLength: number;
}) {
  const isMouseOverStartPoint = React.useRef(false);
  const stageRef = React.useRef<Konva.Stage>(null);

  const [curMousePos, setCurMousePos] = React.useState<number[]>([]);
  const [lineConfig, setLineConfig] = React.useState<Konva.LineConfig>();
  const [stageConfig, setStageConfig] = React.useState<Konva.StageConfig>({
    container: "container",
  });
  const [test, setTest] = React.useState("");

  useEffect(() => {
    clear();
    setStageConfig({
      ...stageConfig,
      scaleX: 1,
      scaleY: 1,
    });
  }, [image]);

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (image && !lineConfig?.closed) {
      const { x, y } = getCoordinate(e);
      if (x && y) {
        setLineConfig({
          points: [
            ...((lineConfig?.points as number[]) ?? []),
            ...(!isMouseOverStartPoint.current
              ? [x, y]
              : (lineConfig?.points as number[]).slice(0, 2)),
          ],
          closed: isMouseOverStartPoint.current,
        });
      }
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (image) {
      const { x, y } = getCoordinate(e);

      if (x && y) {
        setCurMousePos([x, y]);
      }
    }
  };

  const clear = () => {
    setLineConfig(undefined);
    isMouseOverStartPoint.current = false;
  };

  const isSimilarColor = (color1: number[], color2: number[]) => {
    // Calculate delta values for RGB channels
    const deltaRed = Math.abs(color1[0] - color2[0]);
    const deltaGreen = Math.abs(color1[1] - color2[1]);
    const deltaBlue = Math.abs(color1[2] - color2[2]);

    // Check if the total delta is within the threshold
    return deltaRed + deltaGreen + deltaBlue <= 30;
  };

  const points = [
    ...((lineConfig?.points ?? []) as number[]),
    ...(!lineConfig?.closed ? curMousePos : []),
  ];

  const newScale = stageRef.current?.scaleX() ?? 1;

  return (
    <div className="relative">
      <Stage
        id="container"
        {...stageConfig}
        ref={stageRef}
        width={256}
        height={256}
        className="w-[256px] h-[256px] bg-white shadow-sm"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onDragEnd={(e) =>
          setStageConfig({
            ...stageConfig,
            x: e.target.x(),
            y: e.target.y(),
          })
        }
        onWheel={(e) => {
          e.evt.preventDefault();

          const stage = e.target.getStage();

          if (stage) {
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition() ?? { x: 0, y: 0 };

            const mousePointTo = {
              x: (pointer.x - stage.x()) / oldScale,
              y: (pointer.y - stage.y()) / oldScale,
            };

            let direction = e.evt.deltaY > 0 ? 1 : -1;

            if (e.evt.ctrlKey) {
              direction = -direction;
            }

            const newScale =
              direction > 0
                ? oldScale * SCALE_BY
                : oldScale > 1
                ? oldScale / SCALE_BY
                : 1;

            const maxX = -(stage.width() - stage.width() / newScale) * newScale;
            const maxY =
              -(stage.height() - stage.height() / newScale) * newScale;

            const a = pointer.x - mousePointTo.x * newScale;
            const b = pointer.y - mousePointTo.y * newScale;

            setStageConfig({
              ...stageConfig,
              scale: {
                x: newScale,
                y: newScale,
              },
              x: direction > 0 ? a : a > 0 ? 0 : a < maxX ? maxX : a,
              y: direction > 0 ? b : b > 0 ? 0 : b < maxY ? maxY : b,
            });
          }
        }}
        dragBoundFunc={(pos) => {
          const node = stageRef.current;
          if (node) {
            const maxX = -(node.width() - node.width() / newScale) * newScale;
            const maxY = -(node.height() - node.height() / newScale) * newScale;

            return {
              x: pos.x > 0 ? 0 : pos.x < maxX ? maxX : pos.x,
              y: pos.y > 0 ? 0 : pos.y < maxY ? maxY : pos.y,
            };
          }

          return {
            x: 0,
            y: 0,
          };
        }}
        draggable
      >
        <Layer>
          {image && (
            <Image
              onMouseMove={(event) => {
                const mousePos = event.evt.offsetX;
                const mousePosY = event.evt.offsetY;

                const pixelColor = stageRef.current
                  ?.toCanvas()
                  .getContext("2d")
                  ?.getImageData(mousePos, mousePosY, 1, 1).data;

                if (pixelColor) {
                  const red = pixelColor[0];
                  const green = pixelColor[1];
                  const blue = pixelColor[2];

                  if (isSimilarColor([red, green, blue], [0, 0, 255])) {
                    setTest("Utara");
                  } else if (
                    isSimilarColor([red, green, blue], [222, 170, 37])
                  ) {
                    setTest("Bale Daja");
                  } else if (isSimilarColor([red, green, blue], [255, 0, 0])) {
                    setTest("Merajan");
                  } else if (
                    isSimilarColor([red, green, blue], [0, 133, 255])
                  ) {
                    setTest("Bale Dangin");
                  } else if (
                    isSimilarColor([red, green, blue], [14, 151, 28])
                  ) {
                    setTest("Bale Dauh");
                  } else if (isSimilarColor([red, green, blue], [80, 1, 159])) {
                    setTest("Bale Delod");
                  } else if (
                    isSimilarColor([red, green, blue], [255, 0, 168])
                  ) {
                    setTest("Dapur");
                  } else if (
                    isSimilarColor([red, green, blue], [0, 255, 240])
                  ) {
                    setTest("Penungun Karang");
                  } else if (
                    isSimilarColor([red, green, blue], [217, 217, 217])
                  ) {
                    setTest("Angkul - Angkul");
                  } else {
                    // setTest("");
                  }
                }
              }}
              {...image}
            />
          )}
          {lineConfig?.points && (
            <>
              <Line
                {...lineConfig}
                points={points}
                stroke="#00d00f"
                lineJoin="round"
                dash={[4 / newScale]}
                strokeWidth={2 / newScale}
              />
              {Array.from({ length: lineConfig.points.length / 2 }, (_, i) =>
                lineConfig.points!.slice(i * 2, i * 2 + 2)
              ).map((arr, i) => (
                <Circle
                  key={i}
                  x={arr[0]}
                  y={arr[1]}
                  width={8 / newScale}
                  height={8 / newScale}
                  fill="white"
                  stroke="black"
                  strokeWidth={2 / newScale}
                  onMouseOver={(e) => {
                    if (
                      !lineConfig.closed &&
                      i === 0 &&
                      lineConfig.points!.length >= 4
                    ) {
                      e.target.scale({ x: 2, y: 2 });
                    }
                    isMouseOverStartPoint.current = true;
                  }}
                  onMouseOut={(e) => {
                    e.target.scale({ x: 1, y: 1 });
                    isMouseOverStartPoint.current = false;
                  }}
                />
              ))}
              {points.length >= 4 &&
                Array.from({ length: (points.length - 2) / 2 }, (_, i) =>
                  points.slice(i * 2, i * 2 + 4)
                ).map((arr, i) => {
                  const [x1, y1, x2, y2] = arr;
                  const midX = (x2 + x1) / 2 - 3;
                  const midY = (y2 + y1) / 2 - 2;
                  return (
                    <Text
                      key={i}
                      text={`${(
                        ((Math.round(Math.hypot(x2 - x1, y2 - y1)) / 2.08) *
                          footLength) /
                        100
                      ).toFixed(1)} m`}
                      fontSize={9 / newScale}
                      fill="white"
                      x={midX}
                      y={midY}
                      sceneFunc={(context, shape) => {
                        context.fillStyle = "rgb(0,128,0)";
                        context.fillRect(
                          -3 / newScale,
                          -2 / newScale,
                          shape.width() + 6 / newScale,
                          shape.height() + 4 / newScale
                        );
                        (shape as Konva.Text)._sceneFunc(context);
                      }}
                    />
                  );
                })}
            </>
          )}
        </Layer>
      </Stage>
      <p>{test}</p>
      {image && (
        <div className="absolute -right-[60px] top-1/2 transform -translate-y-1/2 h-fit flex flex-col gap-4 w-fit bg-white shadow-sm p-1 rounded-sm">
          <Tool
            icon={<PlusIcon />}
            tooltip="Zoom In"
            onClick={() => {
              const node = stageRef.current;
              if (node) {
                setStageConfig({
                  ...stageConfig,
                  scaleX: node.scaleX() * SCALE_BY,
                  scaleY: node.scaleY() * SCALE_BY,
                });
              }
            }}
          />
          <Tool
            icon={<MinusIcon />}
            tooltip="Zoom Out"
            onClick={() => {
              const node = stageRef.current;
              if (node && node.scaleX() > 1 && node.scaleY() > 1) {
                setStageConfig({
                  ...stageConfig,
                  x: node.x() - node.x() / newScale,
                  y: node.y() - node.y() / newScale,
                  scaleX: node.scaleX() / SCALE_BY,
                  scaleY: node.scaleY() / SCALE_BY,
                });
              }
            }}
          />
          <Tool icon={<ReloadIcon />} tooltip="Clear" onClick={clear} />
        </div>
      )}
    </div>
  );
}
