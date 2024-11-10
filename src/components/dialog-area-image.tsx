import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Image as ImageKonva, Layer, Stage } from "react-konva";
import { useDropzone } from "react-dropzone";
import {
  BoxIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ReloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import Tool from "./tool";
import Konva from "konva";
import Area from "./area";
import { getCoordinate } from "@/lib/utils";
import Direction from "./direction";

const SCALE_BY = 1.1;

export default function DialogAreaImage({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (areaProps: Konva.LineConfig | undefined) => void;
}) {
  const imageRef = React.useRef<Konva.Image>(null);
  const isMouseOverStartPoint = React.useRef(false);

  const [tool, setTool] = useState<"area">();
  const [curMousePos, setCurMousePos] = React.useState<number[]>([]);
  const [imageProps, setImageProps] = React.useState<Konva.ImageConfig>();
  const [areaProps, setAreaProps] = React.useState<Konva.LineConfig>();

  useEffect(() => {
    if (areaProps?.closed) setTool(undefined);
  }, [areaProps]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const img = new Image();
    const objectURL = URL.createObjectURL(acceptedFiles[0]);
    img.onload = () => {
      setImageProps({
        image: img,
      });
      URL.revokeObjectURL(objectURL);
    };

    img.src = objectURL;
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
    multiple: false,
    onDrop,
  });

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "area") {
      if (!areaProps?.closed) {
        const { x, y } = getCoordinate(e);
        if (x && y) {
          setAreaProps({
            points: [
              ...((areaProps?.points as number[]) ?? []),
              ...(!isMouseOverStartPoint.current ? [x, y] : []),
            ],
            closed: isMouseOverStartPoint.current,
          });
        }
      }
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "area" && !areaProps?.closed) {
      const { x, y } = getCoordinate(e);

      if (x && y) {
        setCurMousePos([x, y]);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setImageProps(undefined);
        onOpenChange(open);
      }}
    >
      <DialogContent className="flex justify-center bg-gray-100">
        {imageProps ? (
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-2">
              <div className="h-fit flex flex-col gap-4 w-fit bg-white shadow-sm p-1 rounded-sm">
                <Tool
                  icon={<PlusIcon />}
                  tooltip="Zoom In"
                  onClick={() => {
                    const node = imageRef.current;
                    if (node) {
                      setImageProps({
                        ...imageProps,
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
                    const node = imageRef.current;
                    if (node) {
                      setImageProps({
                        ...imageProps,
                        scaleX: node.scaleX() / SCALE_BY,
                        scaleY: node.scaleY() / SCALE_BY,
                      });
                    }
                  }}
                />
                <Tool
                  icon={<BoxIcon />}
                  tooltip="Area"
                  selected={tool === "area"}
                  disabled={areaProps?.closed}
                  onClick={() => setTool("area")}
                />
                <Tool
                  icon={<ReloadIcon />}
                  tooltip="Clear"
                  onClick={() => {
                    setAreaProps(undefined);
                    isMouseOverStartPoint.current = false;
                  }}
                />
              </div>
              <div className="flex flex-col gap-4 w-fit bg-white shadow-sm p-1 rounded-sm">
                <Tool
                  icon={<CheckIcon />}
                  tooltip="Save"
                  disabled={!areaProps?.closed}
                  onClick={() => onSave(areaProps)}
                />
              </div>
            </div>
            <Stage
              width={256}
              height={256}
              className="w-[256px] h-[256px] bg-white shadow-sm"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
            >
              <Layer>
                <ImageKonva
                  ref={imageRef}
                  {...imageProps}
                  draggable
                  onDragEnd={(e) =>
                    setImageProps({
                      ...imageProps,
                      x: e.target.x(),
                      y: e.target.y(),
                    })
                  }
                />
                <Direction direction="north" />
                {areaProps && (
                  <Area
                    props={{
                      ...areaProps,
                      points: [
                        ...(areaProps?.points as number[]),
                        ...(!areaProps.closed ? curMousePos : []),
                      ],
                    }}
                    isSelected={tool === "area" && (areaProps.closed ?? false)}
                    onMouseOver={() => (isMouseOverStartPoint.current = true)}
                    onMouseOut={() => (isMouseOverStartPoint.current = false)}
                    onSelect={() => setTool("area")}
                    onChange={(newAttrs) => {
                      setAreaProps({ ...areaProps, ...newAttrs });
                    }}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        ) : (
          <div {...getRootProps()}>
            <div className="flex flex-col justify-center items-center border-2 border-dashed hover:bg-muted hover:cursor-pointer hover:border-muted-foreground/50 px-2 py-4 rounded-md">
              <input {...getInputProps()} />
              <UploadIcon />
              <p className="text-xs text-center text-gray-500 mt-4">
                Drag 'n' drop some files here, or click to select files
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
