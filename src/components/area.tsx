import Konva from "konva";
import React from "react";
import { Circle, Line, Transformer } from "react-konva";

export default function Area({
  props,
  isSelected,
  onMouseOver,
  onMouseOut,
  onSelect,
  onChange,
}: {
  props: Konva.LineConfig | undefined;
  isSelected: boolean;
  onMouseOver: () => void;
  onMouseOut: () => void;
  onSelect: () => void;
  onChange: (props: Konva.LineConfig) => void;
}) {
  const lineRef = React.useRef<Konva.Line>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && trRef.current && lineRef.current) {
      // we need to attach transformer manually
      trRef.current.nodes([lineRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Line
        ref={lineRef}
        {...props}
        onClick={onSelect}
        onTap={onSelect}
        fill="black"
        stroke="black"
        draggable
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = lineRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            onChange({
              x: node.x(),
              y: node.y(),
              scaleX,
              scaleY,
            });
          }
        }}
      />
      {!props?.closed && (
        <Circle
          x={props?.points?.[0] ?? 0}
          y={props?.points?.[1] ?? 0}
          width={8}
          height={8}
          fill="white"
          stroke="black"
          onMouseOver={(e) => {
            e.target.scale({ x: 2, y: 2 });
            onMouseOver();
          }}
          onMouseOut={(e) => {
            e.target.scale({ x: 1, y: 1 });
            onMouseOut();
          }}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          keepRatio={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      )}
    </>
  );
}
