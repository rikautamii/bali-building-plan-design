// src/components/distance-table.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SouthTier = "S1" | "S2" | "S3";

function getSouthTier(landLength: number, landWidth: number): SouthTier {
  const L = Math.max(landLength, landWidth);
  const W = Math.min(landLength, landWidth);

  // Side1: (>=6 & >=7) dan (<10 & <11) -> versi swap-friendly
  if (L >= 7 && W >= 6 && L < 11 && W < 10) return "S1";

  // Side2: (>=10 & >=11) dan (<12 & <13)
  if (L >= 11 && W >= 10 && L < 13 && W < 12) return "S2";

  return "S3";
}

type DistanceRule = {
  from: string;
  to: string;
  sideKey: string; // label di persamaan: (Guru), (Uma), dst
  multipliers: { S1: number; S2: number; S3: number };
};

const RULES: DistanceRule[] = [
  {
    from: "merajan",
    to: "bale daja",
    sideKey: "Guru",
    multipliers: { S1: 3, S2: 11, S3: 19 },
  },
  {
    from: "bale daja",
    to: "bale kelod",
    sideKey: "Rudra",
    multipliers: { S1: 5, S2: 13, S3: 21 },
  },
  {
    from: "bale kauh",
    to: "bale kangin",
    sideKey: "Sri",
    multipliers: { S1: 9, S2: 17, S3: 25 },
  },
  {
    from: "bale daja",
    to: "dapur",
    sideKey: "Brahma",
    multipliers: { S1: 22, S2: 30, S3: 38 },
  },
  {
    from: "bale daja",
    to: "jineng",
    sideKey: "Sri",
    multipliers: { S1: 25, S2: 33, S3: 41 },
  },
  {
    from: "bale dauh",
    to: "bale daja",
    sideKey: "Kala",
    multipliers: { S1: 15, S2: 23, S3: 31 },
  },
  {
    from: "bale daja",
    to: "tembok",
    sideKey: "Uma",
    multipliers: { S1: 8, S2: 16, S3: 24 },
  },
  {
    from: "penunggun karang",
    to: "tembok",
    sideKey: "Kala",
    multipliers: { S1: 7, S2: 15, S3: 23 },
  },
//   {
//     from: "bale daja",
//     to: "pengijeng",
//     sideKey: "Yama",
//     multipliers: { S1: 4, S2: 12, S3: 20 },
//   },
  {
    from: "bale daja",
    to: "bale dangin",
    sideKey: "Indra",
    multipliers: { S1: 10, S2: 18, S3: 26 },
  },
];

export default function DistanceTable({
  footLength,
  sideFootLengthByKey,
  landLength,
  landWidth,
}: {
  footLength: number;
  sideFootLengthByKey: Record<string, number>;
  landLength: number;
  landWidth: number;
}) {
  const tier = React.useMemo(
    () => getSouthTier(landLength, landWidth),
    [landLength, landWidth]
  );

  const rows = React.useMemo(() => {
    return RULES.map((r) => {
      const side = sideFootLengthByKey[r.sideKey] ?? 0;
      const multiplier = r.multipliers[tier];

      const valueCm = multiplier * footLength + side;
      const valueM = valueCm / 100;

      return {
        label: `${r.from} - ${r.to}`,
        equation: `${multiplier} * footLength + sideFootLength (${r.sideKey})`,
        value: valueM.toFixed(2),
      };
    });
  }, [footLength, sideFootLengthByKey, tier]);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-semibold">Jarak Bangunan</p>
        <p className="text-xs text-muted-foreground">
          Tier: {tier} (based on land size)
        </p>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jarak Bangunan</TableHead>
              <TableHead>Persamaan</TableHead>
              <TableHead className="text-right">Hasil (m)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="capitalize">{row.label}</TableCell>
                <TableCell>{row.equation}</TableCell>
                <TableCell className="text-right">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
