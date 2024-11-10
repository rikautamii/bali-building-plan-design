import {
  BorderSolidIcon,
  BoxIcon,
  CursorArrowIcon,
  FrameIcon,
  GlobeIcon,
  ImageIcon,
  LightningBoltIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import Tool from "./tool";
import * as Types from "@/types/types";

export default function Toolbar({
  toolSelected,
  toolDisabled,
  onSelect,
}: {
  toolSelected: Types.Tool | undefined | null;
  toolDisabled: (tool: Types.Tool) => boolean;
  onSelect: (tool: Types.Tool) => void;
}) {
  return (
    <div className="static md:fixed z-10 left-10 flex md:flex-col items-center justify-center gap-2">
      <p className="font-medium">ToolBox</p>
      <div className="flex md:flex-col gap-4 w-fit bg-white shadow-sm p-1 rounded-sm">
        <Tool
          icon={<CursorArrowIcon />}
          tooltip="Move"
          selected={toolSelected === "mouse"}
          disabled={toolDisabled("mouse")}
          onClick={() => onSelect("mouse")}
        />
        <Tool
          icon={<BoxIcon />}
          tooltip="Area"
          selected={toolSelected === "area"}
          disabled={toolDisabled("area")}
          onClick={() => onSelect("area")}
        />
        <Tool
          icon={<FrameIcon />}
          tooltip="Area"
          selected={toolSelected === "area-image"}
          disabled={toolDisabled("area-image")}
          onClick={() => onSelect("area-image")}
        />
        <Tool
          icon={<BorderSolidIcon />}
          tooltip="Street"
          selected={toolSelected === "street"}
          disabled={toolDisabled("street")}
          onClick={() => onSelect("street")}
        />
        <Tool
          icon={<ImageIcon />}
          tooltip="Image"
          selected={toolSelected === "image"}
          disabled={toolDisabled("image")}
          onClick={() => onSelect("image")}
        />
        <Tool
          icon={<GlobeIcon />}
          tooltip="Long Lat"
          selected={toolSelected === "long-lat"}
          disabled={toolDisabled("long-lat")}
          onClick={() => onSelect("long-lat")}
        />
        <Tool
          icon={<ReloadIcon />}
          tooltip="Clear"
          onClick={() => onSelect("clear")}
        />
      </div>
      <div className="flex flex-col gap-4 w-fit bg-white shadow-sm p-1 rounded-sm">
        <Tool
          icon={<LightningBoltIcon />}
          tooltip="Generate"
          onClick={() => onSelect("generate")}
        />
      </div>
    </div>
  );
}
