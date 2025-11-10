"use client";

import { useState } from "react";
import type { ExportFormat, GradientState } from "@/lib/gradient";
import { downloadBlob, exportImage } from "@/lib/gradient";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { Label } from "@/components/ui/label";

const PRESETS = [
  { label: "HD 1080p", w: 1920, h: 1080 },
  { label: "2K QHD", w: 2560, h: 1440 },
  { label: "4K UHD", w: 3840, h: 2160 },
  { label: "Ultrawide", w: 3440, h: 1440 },
  { label: "5K", w: 5120, h: 2880 },
  { label: "Square 1:1", w: 3000, h: 3000 },
];

type Props = {
  state: GradientState;
};

export default function ExportPanel({ state }: Props) {
  const [presetIdx, setPresetIdx] = useState(2);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(0.95);
  const [busy, setBusy] = useState(false);

  const { w, h } =
    PRESETS[Math.max(0, Math.min(PRESETS.length - 1, presetIdx))];

  const onExport = async () => {
    try {
      setBusy(true);
      const blob = await exportImage(state, w, h, format, quality);
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      downloadBlob(blob, `gradient-${w}x${h}-${ts}.${format}`);
    } finally {
      setBusy(false);
    }
  };

  const qualityOptions = [
    { label: "100%", value: "1" },
    { label: "95%", value: "0.95" },
    { label: "90%", value: "0.9" },
    { label: "80%", value: "0.8" },
    { label: "70%", value: "0.7" },
    { label: "60%", value: "0.6" },
  ];

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Label className="text-foreground/80">Resolution</Label>
        <Combobox
          data={PRESETS.map((p, i) => ({
            label: `${p.label} (${p.w}×${p.h})`,
            value: String(i),
          }))}
          type="resolution"
          value={String(presetIdx)}
          onValueChange={(v) => setPresetIdx(Number(v))}>
          <ComboboxTrigger className="w-full" />
          <ComboboxContent>
            <ComboboxInput />
            <ComboboxList>
              <ComboboxEmpty />
              <ComboboxGroup>
                {PRESETS.map((p, i) => (
                  <ComboboxItem key={i} value={String(i)}>
                    {p.label} ({p.w}×{p.h})
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label className="text-foreground/80">Format</Label>
          <Combobox
            data={[
              { label: "PNG", value: "png" },
              { label: "JPEG", value: "jpeg" },
              { label: "WEBP", value: "webp" },
            ]}
            type="format"
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}>
            <ComboboxTrigger className="w-full" />
            <ComboboxContent>
              <ComboboxInput />
              <ComboboxList>
                <ComboboxEmpty />
                <ComboboxGroup>
                  <ComboboxItem value="png">PNG</ComboboxItem>
                  <ComboboxItem value="jpeg">JPEG</ComboboxItem>
                  <ComboboxItem value="webp">WEBP</ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="grid gap-1">
          <Label className="text-foreground/80">
            Quality
            <span className="ml-1 text-foreground/50 text-xs">
              {format === "png"
                ? "(not applicable)"
                : `${Math.round(quality * 100)}%`}
            </span>
          </Label>
          <Combobox
            data={qualityOptions}
            type="quality"
            value={String(quality)}
            onValueChange={(v) => setQuality(Number(v))}
            open={format === "png" ? false : undefined}>
            <ComboboxTrigger className="w-full" disabled={format === "png"} />
            <ComboboxContent>
              <ComboboxInput />
              <ComboboxList>
                <ComboboxEmpty />
                <ComboboxGroup>
                  {qualityOptions.map((q) => (
                    <ComboboxItem key={q.value} value={q.value}>
                      {q.label}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
                <ComboboxSeparator />
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <Button
        disabled={busy}
        onClick={onExport}
        aria-busy={busy}
        aria-label={`Export ${w} by ${h} ${format.toUpperCase()}`}>
        {busy ? "Exporting..." : "Export"}
      </Button>
    </div>
  );
}
