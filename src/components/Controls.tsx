"use client";

import { useId, useState } from "react";
import type { GradientState, MeshBlob } from "@/lib/gradient";
import { PlusIcon, TrashIcon, XIcon } from "@/components/Icons";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/kibo-ui/color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type Props = {
  state: GradientState;
  onChange: (next: GradientState) => void;
};

export default function Controls({ state, onChange }: Props) {
  const id = useId();

  if (state.type === "linear") {
    return (
      <div className="space-y-3">
        <CollapsibleSection
          title="Angle"
          description="Rotate the gradient direction">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-foreground/60">
            <label
              htmlFor={`${id}-angle`}
              className="font-medium text-foreground/80">
              Angle
            </label>
            <span>{Math.round(state.angleDeg)}°</span>
          </div>
          <Slider
            id={`${id}-angle`}
            min={0}
            max={360}
            step={1}
            value={[state.angleDeg]}
            onValueChange={([angleDeg]) =>
              onChange({ ...state, angleDeg: angleDeg ?? state.angleDeg })
            }
          />
        </CollapsibleSection>
        <CollapsibleSection
          title="Color stops"
          description="Blend multiple hues along the gradient">
          <StopsEditor
            stops={state.stops}
            onChange={(stops) => onChange({ ...state, stops })}
          />
        </CollapsibleSection>
      </div>
    );
  }

  if (state.type === "radial") {
    return (
      <div className="space-y-3">
        <CollapsibleSection
          title="Position"
          description="Adjust the hotspot placement and falloff"
          defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <LabeledNumber
              id={`${id}-cx`}
              label="Center X"
              min={0}
              max={1}
              step={0.01}
              value={state.cx}
              onChange={(cx) => onChange({ ...state, cx })}
            />
            <LabeledNumber
              id={`${id}-cy`}
              label="Center Y"
              min={0}
              max={1}
              step={0.01}
              value={state.cy}
              onChange={(cy) => onChange({ ...state, cy })}
            />
            <LabeledNumber
              id={`${id}-r`}
              label="Radius"
              min={0}
              max={1}
              step={0.01}
              value={state.r}
              onChange={(r) => onChange({ ...state, r })}
            />
          </div>
        </CollapsibleSection>
        <CollapsibleSection
          title="Color stops"
          description="Fine-tune glow layers">
          <StopsEditor
            stops={state.stops}
            onChange={(stops) => onChange({ ...state, stops })}
          />
        </CollapsibleSection>
      </div>
    );
  }

  // mesh
  return (
    <div className="space-y-3">
      <CollapsibleSection
        title="Background"
        description="Base tone that anchors the mesh"
        defaultOpen>
        <div className="rounded-md border border-foreground/15 p-3">
          <ColorPicker
            value={state.background}
            onChange={(val) => {
              if (Array.isArray(val)) {
                const [r, g, b] = val as number[];
                onChange({ ...state, background: arrayToHex([r, g, b]) });
              }
            }}
            className="grid gap-3">
            <div className="h-28 rounded-md overflow-hidden">
              <ColorPickerSelection className="h-full" />
            </div>
            <ColorPickerHue />
            <ColorPickerAlpha />
            <div className="flex items-center justify-between gap-2">
              <ColorPickerOutput />
              <ColorPickerFormat className="w-full" />
            </div>
          </ColorPicker>
        </div>
      </CollapsibleSection>
      <CollapsibleSection
        title="Blend & texture"
        description="Control softness, noise, and vignette falloff"
        defaultOpen={false}>
        <div className="grid grid-cols-3 gap-3">
          <LabeledNumber
            id={`${id}-soft`}
            label="Softness"
            min={0}
            max={1}
            step={0.01}
            value={state.softness ?? 0.75}
            onChange={(softness) => onChange({ ...state, softness })}
          />
          <LabeledNumber
            id={`${id}-noise`}
            label="Noise"
            min={0}
            max={0.25}
            step={0.005}
            value={state.noise ?? 0.03}
            onChange={(noise) => onChange({ ...state, noise })}
          />
          <div className="grid items-end">
            <label className="text-sm text-foreground/80">Vignette</label>
            <Button
              type="button"
              size="sm"
              variant={state.vignette ?? true ? "default" : "outline"}
              onClick={() =>
                onChange({ ...state, vignette: !(state.vignette ?? true) })
              }>
              {state.vignette ?? true ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </CollapsibleSection>
      <CollapsibleSection
        title={`Blobs (${state.blobs.length})`}
        description="Layer vibrant blobs to sculpt depth"
        defaultOpen={false}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/80">Active blobs</span>
          <Button
            type="button"
            size="icon-sm"
            onClick={() =>
              onChange({
                ...state,
                blobs: [
                  ...state.blobs,
                  { x: 0.3, y: 0.3, r: 0.35, color: "#7c3aed", alpha: 0.88 },
                ],
              })
            }
            aria-label="Add blob">
            <PlusIcon />
          </Button>
        </div>
        <div className="grid gap-3">
          {state.blobs.map((blob, i) => (
            <BlobEditor
              key={i}
              blob={blob}
              onChange={(b) =>
                onChange({
                  ...state,
                  blobs: state.blobs.map((bb, idx) => (idx === i ? b : bb)),
                })
              }
              onRemove={() =>
                onChange({
                  ...state,
                  blobs: state.blobs.filter((_, idx) => idx !== i),
                })
              }
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function LabeledNumber({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm text-foreground/80">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StopsEditor({
  stops,
  onChange,
}: {
  stops: { offset: number; color: string }[];
  onChange: (stops: { offset: number; color: string }[]) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/80">Color Stops</span>
        <Button
          type="button"
          size="icon-sm"
          onClick={() =>
            onChange([...stops, { offset: 0.5, color: "#22d3ee" }])
          }
          aria-label="Add stop">
          <PlusIcon />
        </Button>
      </div>
      <div className="grid gap-2">
        {stops.map((stop, i) => (
          <div
            key={i}
            className="rounded-lg border border-foreground/10 bg-background/40 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>Stop {i + 1}</span>
              <span>{Math.round(stop.offset * 100)}%</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[stop.offset]}
              onValueChange={([offset]) =>
                onChange(
                  stops.map((s, idx) =>
                    idx === i ? { ...s, offset: offset ?? s.offset } : s
                  )
                )
              }
            />
            <div className="flex items-center gap-2">
              <ColorChip
                color={stop.color}
                ariaLabel={`Choose color for stop ${i + 1}`}
                onColorChange={(color) =>
                  onChange(
                    stops.map((s, idx) => (idx === i ? { ...s, color } : s))
                  )
                }
              />
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => onChange(stops.filter((_, idx) => idx !== i))}
                aria-label="Remove stop">
                <XIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorChip({
  color,
  onColorChange,
  ariaLabel,
  allowAlpha = false,
  className,
}: {
  color: string;
  onColorChange: (color: string, alpha?: number) => void;
  ariaLabel: string;
  allowAlpha?: boolean;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-10 rounded-md border-foreground/20 bg-background/60 p-1",
            className
          )}
          aria-label={ariaLabel}>
          <span
            aria-hidden
            className="block h-full w-full rounded-sm border border-foreground/10 shadow-inner"
            style={{ background: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] space-y-3 p-4" align="end">
        <ColorPicker
          key={color}
          value={color}
          onChange={(val) => {
            if (Array.isArray(val)) {
              const [r, g, b, a = 1] = val as number[];
              onColorChange(arrayToHex([r, g, b]), a);
            }
          }}
          className="grid gap-3">
          <div className="h-24 rounded-md border border-foreground/10 overflow-hidden">
            <ColorPickerSelection className="h-full" />
          </div>
          <ColorPickerHue />
          {allowAlpha && <ColorPickerAlpha />}
          <div className="flex items-center justify-between gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat className="w-full" />
          </div>
        </ColorPicker>
      </PopoverContent>
    </Popover>
  );
}

function arrayToHex([r = 0, g = 0, b = 0]: number[]): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function BlobEditor({
  blob,
  onChange,
  onRemove,
}: {
  blob: MeshBlob;
  onChange: (b: MeshBlob) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-foreground/10 p-3 grid gap-2">
      <div className="grid grid-cols-2 gap-3">
        <LabeledNumber
          id="x"
          label="X"
          min={0}
          max={1}
          step={0.01}
          value={blob.x}
          onChange={(x) => onChange({ ...blob, x })}
        />
        <LabeledNumber
          id="y"
          label="Y"
          min={0}
          max={1}
          step={0.01}
          value={blob.y}
          onChange={(y) => onChange({ ...blob, y })}
        />
        <LabeledNumber
          id="r"
          label="Radius"
          min={0}
          max={1}
          step={0.01}
          value={blob.r}
          onChange={(r) => onChange({ ...blob, r })}
        />
        <LabeledNumber
          id="a"
          label="Alpha"
          min={0}
          max={1}
          step={0.01}
          value={blob.alpha ?? 0.9}
          onChange={(alpha) => onChange({ ...blob, alpha })}
        />
      </div>
      <div className="flex items-center gap-3">
        <ColorChip
          color={blob.color}
          allowAlpha
          ariaLabel="Choose blob color"
          className="h-10 w-12"
          onColorChange={(color, alpha) =>
            onChange({
              ...blob,
              color,
              alpha: alpha ?? blob.alpha ?? 0.9,
            })
          }
        />
        <span className="text-xs text-foreground/60">
          {Math.round((blob.alpha ?? 0.9) * 100)}% opacity
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          onClick={onRemove}
          aria-label="Remove blob">
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-foreground/10 bg-background/40 p-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-xs text-foreground/60">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200 text-foreground/60",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {open ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
}
