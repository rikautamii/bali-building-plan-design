"use client";

import React, { useEffect } from "react";
import { Image as ImageKonva, Layer, Rect, Stage } from "react-konva";
import Toolbar from "./toolbar";
import Direction from "./direction";
import Konva from "konva";
import { Tool } from "@/types/types";
import Street from "./street";
import Area from "./area";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import * as tf from "@tensorflow/tfjs";
import Legend from "./legend";
import { delay, getCoordinate } from "@/lib/utils";
import LoadingOverlay from "./loading-overlay";
import DialogAreaImage from "./dialog-area-image";
import Output from "./output";
import DialogInput from "./dialog-input";
import DialogLongLat from "./dialog-long-lat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Main() {
  const stageRef = React.useRef<Konva.Stage>(null);
  const isDrawing = React.useRef(false);
  const isMouseOverStartPoint = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [curMousePos, setCurMousePos] = React.useState<number[]>([]);

  const [tool, setTool] = React.useState<Tool>("mouse");

  const [street, setStreet] = React.useState<Konva.ShapeConfig>();

  const [area, setArea] = React.useState<Konva.LineConfig>();

  const [image, setImage] = React.useState<Konva.ImageConfig>();

  const [outputImage, setOutputImage] = React.useState<Konva.ImageConfig>();

  const [objectSelected, setObjectSelected] = React.useState<
    "area" | "street"
  >();

  const [footLength, setFootLength] = React.useState(26);

  const [isLoading, setIsLoading] = React.useState(false);

  const [remainingOutputArea, setRemainingOutputArea] = React.useState(0);
  const [surfaceArea, setSurfaceArea] = React.useState(0);
  const [remainingGroundTruthArea, setRemainingGroundTruthArea] =
    React.useState<number>();

  useEffect(() => {
    setRemainingGroundTruthArea(undefined);
  }, [outputImage]);

  useEffect(() => {
    if (area?.closed) {
      isDrawing.current = false;
      setTool("mouse");
    }
  }, [area]);

  useEffect(() => {
    if (street) setTool("mouse");
  }, [street]);

  useEffect(() => {
    let handleDeleteArea = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        setObjectSelected(undefined);
        if (objectSelected === "area") {
          setArea(undefined);
          isMouseOverStartPoint.current = false;
        } else if (objectSelected === "street") {
          setStreet(undefined);
        }
      }
    };
    window.addEventListener("keydown", handleDeleteArea);
    return () => {
      window.removeEventListener("keydown", handleDeleteArea);
    };
  }, [objectSelected]);

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "area") {
      if (!area?.closed) {
        const { x, y } = getCoordinate(e);
        if (x && y) {
          setArea({
            points: [
              ...((area?.points as number[]) ?? []),
              ...(!isMouseOverStartPoint.current ? [x, y] : []),
            ],
            closed: isMouseOverStartPoint.current,
          });
          isDrawing.current = true;
        }
      }
    } else if (tool === "street") {
      if (!street) {
        const { x, y } = getCoordinate(e);
        if (x && y) {
          setStreet({
            x: x,
            y: y,
            width: 100,
            height: 4,
          });
        }
      }
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "area" && !area?.closed) {
      const { x, y } = getCoordinate(e);

      if (x && y) {
        setCurMousePos([x, y]);
      }
    }
  };

  const generateImage = async () => {
    setIsLoading(true);
    await delay(1000);
    const canvasElement = stageRef?.current?.toCanvas();

    if (canvasElement) {
      const model = await tf.loadLayersModel("/model/model.json");
      const outputTensor = tf.tidy(() => {
        let img = tf.browser.fromPixels(canvasElement).toFloat();

        img = tf.image.resizeBilinear(img, [256, 256]);
        img = img.expandDims().div(127.5).sub(1);

        const outputTensor = model.apply(img, {
          training: true,
        }) as tf.Tensor;

        return outputTensor
          .reshape([256, 256, 3])
          .mul(0.5)
          .add(0.5)
          .mul(255)
          .toInt() as tf.Tensor3D;
      });

      var canvas = document.createElement("canvas");
      await tf.browser.toPixels(outputTensor, canvas);
      setOutputImage({
        image: canvas,
      });

      console.log(`Luas Tanah: ${calculateBlackArea(canvasElement)}`);
      console.log(`Sisa Luas Tanah: ${calculateBlackArea(canvas)}`);
      setSurfaceArea(calculateBlackArea(canvasElement));
      setRemainingOutputArea(calculateBlackArea(canvas));
    }
    setIsLoading(false);
  };

  const clear = () => {
    setTool("mouse");
    setArea(undefined);
    setStreet(undefined);
    setImage(undefined);
    setOutputImage(undefined);
    isMouseOverStartPoint.current = false;
  };

  const calculateBlackArea = (canvas: HTMLCanvasElement): number => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let blackPixelCount = 0;

    // Tentukan ambang batas untuk warna hitam
    const threshold = 1; // Misalnya, nilai RGB kurang dari 30 dianggap hitam

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Memeriksa apakah piksel mendekati hitam dengan ambang batas
      if (r < threshold && g < threshold && b < threshold && a === 255) {
        blackPixelCount++;
      }
    }

    const pixelsPerMeter = 8 * 8; // 8px = 1m, jadi 64px^2 = 1m^2
    const areaInPixels = blackPixelCount;
    const areaInSquareMeters = areaInPixels / pixelsPerMeter;

    return areaInSquareMeters;
  };

  return (
    <div className="min-h-screen container flex flex-col items-center justify-center p-8">
      <p className="text-2xl font-bold mb-8">Bali Building Plan Design</p>
      {isLoading && <LoadingOverlay />}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png"
        hidden
        onChange={(e) => {
          if ((e.target.files?.length ?? 0) > 0) {
            const img = new Image();
            const selectedImage = e.target.files![0];
            const objectURL = URL.createObjectURL(selectedImage);
            img.onload = () => {
              if (img.width === 256 && img.height === 256) {
                setImage({
                  image: img,
                });
              } else {
                toast("Please upload an image size 256 x 256", {
                  icon: <ExclamationTriangleIcon />,
                });
              }

              URL.revokeObjectURL(objectURL);
              e.target.value = "";
            };

            img.src = objectURL;
          }
        }}
      />
      <Toolbar
        toolSelected={tool}
        onSelect={(tool) => {
          setObjectSelected(undefined);
          if (tool === "image") {
            inputRef.current?.click();
          } else if (tool === "clear") {
            clear();
          } else {
            setTool(tool);
          }
        }}
        toolDisabled={(tool) => {
          if (
            (tool === "area" ||
              tool === "area-image" ||
              tool === "image" ||
              tool === "long-lat") &&
            (area?.closed || image)
          ) {
            return true;
          } else if (tool === "street" && (street || image)) {
            return true;
          } else {
            return false;
          }
        }}
      />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-4">
          <p className="font-medium">Insert Land Image (Denah Lahan)</p>
          <Stage
            ref={stageRef}
            width={256}
            height={256}
            className="w-[256px] h-[256px] bg-white shadow-sm"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onClick={(e) => {
              if (e.target === stageRef.current) {
                setObjectSelected(undefined);
              }
            }}
          >
            <Layer>
              <Rect width={256} height={256} fill="white" listening={false} />
              {image && <ImageKonva {...image} />}
              {!image && <Direction direction="north" />}
              {area && (
                <Area
                  props={{
                    ...area,
                    points: [
                      ...(area?.points as number[]),
                      ...(!area.closed ? curMousePos : []),
                    ],
                  }}
                  isSelected={
                    objectSelected === "area" && (area.closed ?? false)
                  }
                  onMouseOver={() => (isMouseOverStartPoint.current = true)}
                  onMouseOut={() => (isMouseOverStartPoint.current = false)}
                  onSelect={() => {
                    if (!isDrawing.current) setObjectSelected("area");
                  }}
                  onChange={(newAttrs) => {
                    setArea({ ...area, ...newAttrs });
                  }}
                />
              )}
              {street && (
                <Street
                  streetProps={street}
                  isSelected={objectSelected === "street"}
                  onChange={(newAttrs) => {
                    setStreet({ ...street, ...newAttrs });
                  }}
                  onSelect={() => {
                    if (!isDrawing.current) setObjectSelected("street");
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="font-medium">Building Plan Output</p>
          <Output image={outputImage} footLength={footLength} />
        </div>
      </div>
      {outputImage && (
        <div className="flex flex-col gap-4 mt-8">
          <p className="font-semibold">
            Luas Tanah : {surfaceArea} m<sup>2</sup>{" "}
          </p>
          <Table className="bg-background max-w-[600px] mx-auto">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Sisa Luas Tanah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Building Plan Output</TableCell>
                <TableCell>
                  {remainingOutputArea} m<sup>2</sup>
                </TableCell>
              </TableRow>
              {remainingGroundTruthArea && (
                <TableRow>
                  <TableCell>Building Plan Ground Truth</TableCell>
                  <TableCell>
                    {remainingGroundTruthArea} m<sup>2</sup>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <input
            type="file"
            onChange={(e) => {
              if ((e.target.files?.length ?? 0) > 0) {
                const img = new Image();
                const selectedImage = e.target.files![0];
                const objectURL = URL.createObjectURL(selectedImage);
                img.onload = () => {
                  if (img.width === 256 && img.height === 256) {
                    let canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    let context = canvas.getContext("2d");
                    context?.drawImage(img, 0, 0);
                    setRemainingGroundTruthArea(calculateBlackArea(canvas));
                  } else {
                    toast("Please upload an image size 256 x 256", {
                      icon: <ExclamationTriangleIcon />,
                    });
                  }

                  URL.revokeObjectURL(objectURL);
                  e.target.value = "";
                };

                img.src = objectURL;
              }
            }}
            accept="image/jpeg, image/png"
          />
        </div>
      )}
      <div className="flex flex-col items-center gap-4 mt-8">
        <p className="font-medium">Object Color Map</p>
        <Legend />
      </div>

      <DialogAreaImage
        open={tool === "area-image"}
        onOpenChange={(open) => {
          if (!open) setTool("mouse");
        }}
        onSave={(area) => {
          setTool("mouse");
          setArea(area);
        }}
      />
      <DialogLongLat
        open={tool === "long-lat"}
        onOpenChange={(open) => {
          if (!open) setTool("mouse");
        }}
        onSubmit={function (points) {
          setTool("mouse");
          setArea({
            ...area,
            points: points,
            closed: true,
            x: 64, // (width - objectWidth) / 2
            y: 64,
          });
        }}
      />
      <DialogInput
        open={tool === "generate"}
        onOpenChange={(open) => {
          if (!open) setTool("mouse");
        }}
        onSubmit={function (footLength) {
          setTool("mouse");
          setFootLength(footLength);
          generateImage();
        }}
      />
    </div>
  );
}
