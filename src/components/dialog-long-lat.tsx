import React, { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMapEvents,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import data from "../map.json";
import { GeoJsonObject } from "geojson";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { ReloadIcon } from "@radix-ui/react-icons";
import Tool from "./tool";

const formSchema = z.object({
  longLat: z
    .string()
    .transform((arg: string, ctx: z.RefinementCtx) => {
      try {
        return JSON.parse(arg);
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid Format",
        });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.array(z.number()).min(2).max(2)).min(3)),
});

export default function DialogLongLat({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (points: number[]) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      longLat: [],
    },
  });

  const [positions, setPositions] = useState<LatLng[]>([]);
  const [isClose, setClose] = useState<boolean>(false);
  const [curMousePos, setCurMousePos] = useState<LatLng>();
  const isMouseOverStartPoint = React.useRef(false);

  const getX = (x: number, minLon: number, maxLon: number) => {
    var position = (x - minLon) / (maxLon - minLon);
    return 128 * position;
  };

  const getY = (y: number, minLat: number, maxLat: number) => {
    var position = (y - minLat) / (maxLat - minLat);
    return 128 * position;
  };
  function rotateAndKeepCenter(data: any) {
    // Calculate total x and y coordinates
    let totalX = 0;
    let totalY = 0;
    for (const point of data) {
      totalX += point[0];
      totalY += point[1];
    }

    // Calculate center coordinates
    const center = [totalX / data.length, totalY / data.length];

    // Move data to center, rotate, and move back from center
    const rotatedAndCenteredData = data.map((point: any) => {
      const x = point[0] - center[0];
      const y = point[1] - center[1];

      const rotationAngle = Math.PI / 2; // 90 degrees in radians

      const newX = x * Math.cos(rotationAngle) - y * Math.sin(rotationAngle);
      const newY = x * Math.sin(rotationAngle) + y * Math.cos(rotationAngle);

      return [newX + center[0], newY + center[1]];
    });

    return rotatedAndCenteredData;
  }

  function flipData(data: any) {
    return data.map((sublist: any) => [sublist[1], sublist[0]]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="flex flex-col p-10">
        <div className="relative">
          <Button
            size="icon"
            onClick={() => {
              setPositions([]);
              setClose(false);
              isMouseOverStartPoint.current = false;
            }}
            className="absolute z-[9999] right-0 top-0 m-3"
          >
            <ReloadIcon />
          </Button>
          <MapContainer
            center={[-8.566198747752183, 115.41065216064453]}
            zoom={20}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              positions={[
                ...positions,
                ...(!isClose && curMousePos && positions.length > 0
                  ? [curMousePos]
                  : []),
              ]}
              onMapClick={(e) => {
                if (!isClose) {
                  setPositions((prev) => [
                    ...prev,
                    ...(!isMouseOverStartPoint.current
                      ? [e.latlng]
                      : [prev[0]]),
                  ]);
                  if (isMouseOverStartPoint.current) {
                    setClose(true);
                  }
                }
              }}
              onMapMouseMove={(e) => setCurMousePos(e.latlng)}
              onCircleMouseOver={() => (isMouseOverStartPoint.current = true)}
              onCircleMouseOut={() => (isMouseOverStartPoint.current = false)}
            />
            {/* <GeoJSON
            data={data as GeoJsonObject}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: (e) => {
                  const coordinates = (feature.geometry as any)
                    .coordinates[0] as any[];
                  let minX = 0;
                  let minY = 0;
                  let maxX = 0;
                  let maxY = 0;
                  coordinates.forEach((v, i) => {
                    if (i === 0) {
                      minX = maxX = v[0];
                      minY = maxY = v[1];
                    } else {
                      minX = Math.min(v[0], minX);
                      minY = Math.min(v[1], minY);
                      maxX = Math.max(v[0], maxX);
                      maxY = Math.max(v[1], maxY);
                    }
                  });

                  const result = coordinates.map((v) => {
                    const x = getX(v[0], maxX, minX);
                    const y = getY(v[1], maxY, minY);

                    return [x, y];
                  });

                  const f = flipData(result);
                  console.log(f);
                  const rotate = rotateAndKeepCenter(f);

                  onSubmit(rotate.flat());
                },
              });
            }}
          /> */}
          </MapContainer>
        </div>
        <Button
          className="flex ml-auto"
          disabled={!isClose}
          onClick={() => {
            let minX = 0;
            let minY = 0;
            let maxX = 0;
            let maxY = 0;
            positions.forEach((v, i) => {
              if (i === 0) {
                minX = maxX = v.lng;
                minY = maxY = v.lat;
              } else {
                minX = Math.min(v.lng, minX);
                minY = Math.min(v.lat, minY);
                maxX = Math.max(v.lng, maxX);
                maxY = Math.max(v.lat, maxY);
              }
            });

            const result = positions.map((v) => {
              const x = getX(v.lng, maxX, minX);
              const y = getY(v.lat, maxY, minY);

              return [x, y];
            });

            const f = flipData(result);
            console.log(f);
            const rotate = rotateAndKeepCenter(f);

            onSubmit(rotate.flat());
          }}
        >
          Simpan
        </Button>
        {/* <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (values: z.infer<typeof formSchema>) => {
                let minX = 0;
                let minY = 0;
                let maxX = 0;
                let maxY = 0;
                values.longLat.forEach((v, i) => {
                  if (i === 0) {
                    minX = maxX = v[0];
                    minY = maxY = v[1];
                  } else {
                    minX = Math.min(v[0], minX);
                    minY = Math.min(v[1], minY);
                    maxX = Math.max(v[0], maxX);
                    maxY = Math.max(v[1], maxY);
                  }
                });

                const result = values.longLat
                  .map((v) => {
                    const x = getX(v[0], minX, maxX);
                    const y = getY(v[1], minY, maxY);

                    return [x, y];
                  })
                  .flat();

                onSubmit(result);
              }
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="longLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude Latitude</FormLabel>
                  <FormControl>
                    <Input {...field} value={`${field.value}`} />
                  </FormControl>
                  <FormDescription>
                    Example: [[100.522356,13.737528], ...[long, lat]]
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="flex ml-auto" type="submit">
              Submit
            </Button>
          </form>
        </Form> */}
      </DialogContent>
    </Dialog>
  );
}

function LocationMarker({
  positions,
  onMapClick,
  onMapMouseMove,
  onCircleMouseOver,
  onCircleMouseOut,
}: {
  positions: LatLng[];
  onMapMouseMove: (e: LeafletMouseEvent) => void;
  onMapClick: (e: LeafletMouseEvent) => void;
  onCircleMouseOver: (e: LeafletMouseEvent) => void;
  onCircleMouseOut: (e: LeafletMouseEvent) => void;
}) {
  const map = useMapEvents({
    click: onMapClick,
    mousemove: onMapMouseMove,
  });

  return positions.length > 0 ? (
    <>
      <Polyline positions={[...positions]} />
      <Circle
        eventHandlers={{
          mouseover: onCircleMouseOver,
          mouseout: onCircleMouseOut,
        }}
        radius={5}
        center={positions[0]}
      />
    </>
  ) : null;
}
