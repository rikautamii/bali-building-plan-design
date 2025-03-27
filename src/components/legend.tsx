import React from "react";

const legends = [
  {
    name: "Utara",
    color: "#0000FF",
  },
  {
    name: "Bale Daja",
    color: "#DEAA25",
  },
  {
    name: "Merajan",
    color: "#FF0000",
  },
  {
    name: "Bale Dangin",
    color: "#0085FF",
  },
  {
    name: "Bale Dauh",
    color: "#0E971C",
  },
  {
    name: "Bale Delod",
    color: "#50019F",
  },
  {
    name: "Paon",
    color: "#FF00A8",
  },
  {
    name: "Jineng",
    color: "#65200A",
  },
  {
    name: "Penungun Karang",
    color: "#00FFF0",
  },
  {
    name: "Angkul - Angkul",
    color: "#D9D9D9",
  },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
      {legends.map((legend) => (
        <div
          key={legend.name}
          className="flex flex-col items-center gap-1 w-12"
        >
          <div
            style={{
              backgroundColor: legend.color,
            }}
            className="w-7 h-7 rounded-md shadow-md"
          ></div>
          <p className="text-xs text-center">{legend.name}</p>
        </div>
      ))}
    </div>
  );
}
