"use client";

import { useEffect, useMemo, useState } from "react";
import GradientCanvas from "@/components/GradientCanvas";
import Controls from "@/components/Controls";
import ExportPanel from "@/components/ExportPanel";
import type { GradientState } from "@/lib/gradient";
import { generateRandomGradient } from "@/lib/gradient";
import {
  Command,
  Download,
  Palette,
  Shuffle,
  Wand2,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/kibo-ui/pill";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATE_STORAGE_KEY = "gradient-studio-state";
const MODE_STORAGE_KEY = "gradient-studio-mode";
const DEFAULT_MODE: GradientState["type"] = "mesh";
const DEFAULT_GRADIENT: GradientState = {
  type: "mesh",
  background: "#0b1026",
  blobs: [
    { x: 0.2, y: 0.8, r: 0.6, color: "#06b6d4", alpha: 0.95 },
    { x: 0.35, y: 0.35, r: 0.45, color: "#1e40af", alpha: 0.85 },
    { x: 0.72, y: 0.35, r: 0.45, color: "#7c3aed", alpha: 0.9 },
  ],
  blendMode: "lighter",
};

function getStoredMode(): GradientState["type"] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  return stored === "mesh" || stored === "linear" || stored === "radial"
    ? stored
    : null;
}

function getStoredState(): GradientState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }
    if (
      parsed.type === "mesh" ||
      parsed.type === "linear" ||
      parsed.type === "radial"
    ) {
      return parsed as GradientState;
    }
  } catch {
    return null;
  }
  return null;
}

export default function Home() {
  const [mode, setMode] = useState<GradientState["type"]>(DEFAULT_MODE);
  const [state, setState] = useState<GradientState>(DEFAULT_GRADIENT);
  const [readyToPersist, setReadyToPersist] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Keep state shape in sync with selected mode
  const normalized = useMemo<GradientState>(() => {
    if (mode === "linear") {
      if (state.type === "linear") return state;
      return {
        type: "linear",
        angleDeg: 45,
        stops: [
          { offset: 0, color: "#06b6d4" },
          { offset: 1, color: "#7c3aed" },
        ],
      };
    }
    if (mode === "radial") {
      if (state.type === "radial") return state;
      return {
        type: "radial",
        cx: 0.5,
        cy: 0.5,
        r: 0.7,
        stops: [
          { offset: 0, color: "#3b82f6" },
          { offset: 1, color: "#111827" },
        ],
      };
    }
    if (state.type === "mesh") return state;
    return {
      type: "mesh",
      background: "#0b1026",
      blobs: [
        { x: 0.2, y: 0.8, r: 0.6, color: "#06b6d4", alpha: 0.95 },
        { x: 0.35, y: 0.35, r: 0.45, color: "#1e40af", alpha: 0.85 },
        { x: 0.72, y: 0.35, r: 0.45, color: "#7c3aed", alpha: 0.9 },
      ],
      blendMode: "lighter",
    };
  }, [mode, state]);

  useEffect(() => {
    const savedMode = getStoredMode();
    const savedState = getStoredState();

    if (savedState) {
      setState(savedState);
      setMode(savedState.type);
    } else {
      if (savedMode) {
        setMode(savedMode);
      }
      const targetMode = savedMode ?? DEFAULT_MODE;
      setState(generateRandomGradient(targetMode));
    }

    setReadyToPersist(true);
  }, []);

  useEffect(() => {
    if (!readyToPersist) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // ignore quota errors
    }
  }, [mode, normalized, readyToPersist]);

  return (
    <div className="min-h-dvh p-6 md:p-10 grid gap-8">
      <header className="flex flex-col gap-6 md:gap-8">
        <div className="rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                <Command className="size-4" />
              </span>
              <div className="hidden md:inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-foreground/60">
                beta access
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {(["mesh", "linear", "radial"] as const).map((t) => (
                <button
                  key={t}
                  className="focus-visible:outline-none"
                  onClick={() => setMode(t)}
                  aria-pressed={mode === t}
                  aria-label={`Switch to ${t} mode`}>
                  <Pill variant={mode === t ? "default" : "secondary"}>
                    {t}
                  </Pill>
                </button>
              ))}
              <Button
                size="icon"
                variant="outline"
                onClick={() => setState(generateRandomGradient(mode))}
                aria-label="Generate random gradient">
                <Shuffle className="size-4" />
              </Button>
              <ThemeToggle />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setNavOpen((prev) => !prev)}
              aria-label={navOpen ? "Close navigation" : "Open navigation"}>
              {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
          {navOpen ? (
            <div className="mt-3 space-y-4 md:hidden">
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                <div className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-foreground/60">
                  beta access
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["mesh", "linear", "radial"] as const).map((t) => (
                  <Pill
                    key={t}
                    variant={mode === t ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setMode(t);
                      setNavOpen(false);
                    }}>
                    {t}
                  </Pill>
                ))}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setState(generateRandomGradient(mode));
                    setNavOpen(false);
                  }}
                  aria-label="Generate random gradient">
                  <Shuffle className="size-4" />
                </Button>
                <ThemeToggle />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3" id="workspace">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/70 backdrop-blur">
            Crafted with Kibo UI excellence
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            Design cinematic gradients in seconds.
          </h1>
          <p className="text-sm md:text-base text-foreground/70">
            Switch between mesh, linear, and radial canvases, tune every stop
            with precision pickers, and export wallpapers that feel at home on
            any display.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60">
            <span>
              created by{" "}
              <a
                href="https://github.com/gh0styx"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground">
                @gh0styx
              </a>
            </span>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <span>export up to 5K · 100% client-side · zero installs</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {(["mesh", "linear", "radial"] as const).map((t) => (
            <Pill
              key={t}
              variant={mode === t ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setMode(t)}>
              {t}
            </Pill>
          ))}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setState(generateRandomGradient(mode))}
            aria-label="Generate random gradient">
            <Shuffle className="size-4" />
          </Button>
        </div>
      </div> */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="glass-surface border-foreground/10 shadow-[0_12px_48px_-18px_rgba(0,0,0,0.45)]">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="flex items-center justify-between text-base font-medium text-foreground/80">
              Live wallpaper preview
              <span className="text-xs text-foreground/50">
                {mode === "mesh"
                  ? "Mesh gradient"
                  : mode === "linear"
                  ? "Linear gradient"
                  : "Radial gradient"}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-foreground/60">
              Preview updates in real-time. Toggle aspect ratios in the
              controls.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div
              className="relative w-full overflow-hidden rounded-xl border border-foreground/10 bg-background/40"
              style={{ aspectRatio: "16/9" }}>
              <GradientCanvas
                state={normalized}
                width={1280}
                height={720}
                responsive
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface border-foreground/10">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-sm font-semibold">
              Designer tools
            </CardTitle>
            <CardDescription className="text-xs text-foreground/60">
              Fine-tune gradients, explore palettes, and export production-ready
              assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-6">
            <Controls
              state={normalized}
              onChange={setState as (s: GradientState) => void}
            />
            <Separator />
            <ExportPanel state={normalized} />
          </CardContent>
          <CardFooter className="px-5 pb-5 text-xs text-foreground/50">
            Tip: tap any color chip to open the advanced picker.
          </CardFooter>
        </Card>
      </div>

      <section
        id="highlights"
        className="grid gap-6 rounded-2xl border border-foreground/10 bg-background/40 p-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
            Highlights
          </h2>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li className="flex items-start gap-2">
              <Wand2 className="mt-0.5 size-3.5 text-foreground/60" />
              <span>
                Realtime preview with cinematic mesh &amp; radial blending.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Palette className="mt-0.5 size-3.5 text-foreground/60" />
              <span>
                Palette engine and precision color picker powered by Kibo UI.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Download className="mt-0.5 size-3.5 text-foreground/60" />
              <span>
                Export up to 5K in PNG, JPEG, or WEBP — entirely client-side.
              </span>
            </li>
          </ul>
        </div>
        <div />
      </section>

      <footer className="grid gap-4 border-t border-foreground/10 pt-6 text-xs text-foreground/60 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
        <div className="space-y-2 text-sm text-foreground/65">
          <p className="text-foreground/80 font-medium">
            Crafted with Kibo UI excellence
          </p>
          <p>
            Design cinematic gradients in seconds. Switch between mesh, linear,
            and radial canvases, tune every stop with precision pickers, and
            keep everything synced locally.
          </p>
          <p>
            created by{" "}
            <a
              href="https://github.com/gh0styx"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground">
              @gh0styx
            </a>
          </p>
          <p>export up to 5K · 100% client-side · zero installs</p>
        </div>
        <p className="md:text-right">
          Built with Next.js · React 19 · Tailwind · Kibo UI
        </p>
      </footer>
    </div>
  );
}
