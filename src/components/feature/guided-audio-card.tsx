import { useRef } from "react";
import { ChevronDown, ExternalLink, Music2, Pause, Play, SkipBack, SkipForward, Upload, Volume2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GuidedAudioCardProps {
  title: string;
  subtitle: string;
  isPlaying: boolean;
  stateLabel: string;
  stateTone?: "default" | "active" | "muted";
  progress: number;
  onSeekProgress: (value: number) => void;
  elapsedLabel: string;
  totalLabel: string;
  speed: number;
  onSpeedChange: (next: number) => void;
  stepTime: number;
  onStepTimeChange: (seconds: number) => void;
  countdown: number;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onStop: () => void;
  ambientPlaying: boolean;
  ambientTrackLabel: string;
  onToggleAmbient: () => void;
  onPickMusic: (file: File) => void;
  onOpenSpotify: () => void;
  onConnectSpotify: () => void;
  spotifyConnected: boolean;
  onOpenYouTubeMusic: () => void;
  onOpenGaana: () => void;
  musicAppStatus: string;
  controlsDisabled?: boolean;
}

export function GuidedAudioCard(props: GuidedAudioCardProps) {
  const {
    title,
    subtitle,
    isPlaying,
    stateLabel,
    stateTone = "default",
    progress,
    onSeekProgress,
    elapsedLabel,
    totalLabel,
    speed,
    onSpeedChange,
    stepTime,
    onStepTimeChange,
    countdown,
    onPrevious,
    onTogglePlay,
    onNext,
    onStop,
    ambientPlaying,
    ambientTrackLabel,
    onToggleAmbient,
    onPickMusic,
    onOpenSpotify,
    onConnectSpotify,
    spotifyConnected,
    onOpenYouTubeMusic,
    onOpenGaana,
    musicAppStatus,
    controlsDisabled,
  } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stateToneClass =
    stateTone === "active"
      ? "bg-emerald-500/20 text-emerald-300"
      : stateTone === "muted"
        ? "bg-zinc-500/20 text-zinc-300"
        : "bg-zinc-700/30 text-zinc-200";

  return (
    <Card className="relative overflow-hidden border-white/15 bg-zinc-900/60 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/60">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-emerald-500/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="mt-1 text-base text-zinc-200">{subtitle}</CardDescription>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stateToneClass}`}>{stateLabel}</span>
        </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.max(0, Math.min(100, progress))}
          onChange={(event) => onSeekProgress(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-emerald-500"
          aria-label="Guide progress"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-zinc-300">
          <span>{elapsedLabel}</span>
          <span>{totalLabel}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" className="h-11 w-11 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={onPrevious} disabled={controlsDisabled} aria-label="Previous step">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant={isPlaying ? "default" : "secondary"} size="lg" className="h-14 w-14 rounded-full p-0 shadow-lg" onClick={onTogglePlay} disabled={controlsDisabled} aria-label={isPlaying ? "Pause guide" : "Play guide"}>
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="sm" className="h-11 w-11 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={onNext} disabled={controlsDisabled} aria-label="Next step">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" className="h-10 w-10 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={onStop} disabled={controlsDisabled} aria-label="Stop voice">
          <Volume2 className="h-4 w-4" />
        </Button>
        <Button variant={ambientPlaying ? "default" : "outline"} size="sm" className="h-10 w-10 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={onToggleAmbient} aria-label="Toggle ambient audio">
          <Music2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="guided-speed-select">
            Speed
          </label>
          <div className="relative ml-auto">
            <select
              id="guided-speed-select"
              value={String(speed)}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
              disabled={controlsDisabled}
              className="h-11 min-w-24 appearance-none rounded-full border border-zinc-600/60 bg-zinc-950/80 px-4 pr-9 text-sm font-semibold text-zinc-100 outline-none ring-0 focus:border-emerald-500"
            >
              <option value="0.8">0.8x</option>
              <option value="1">1x</option>
              <option value="1.2">1.2x</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="guided-step-select">
            Step
          </label>
          <div className="relative ml-auto">
            <select
              id="guided-step-select"
              value={String(stepTime)}
              onChange={(event) => onStepTimeChange(Number(event.target.value))}
              disabled={controlsDisabled}
              className="h-11 min-w-24 appearance-none rounded-full border border-zinc-600/60 bg-zinc-950/80 px-4 pr-9 text-sm font-semibold text-zinc-100 outline-none ring-0 focus:border-emerald-500"
            >
              <option value="3">3s</option>
              <option value="5">5s</option>
              <option value="7">7s</option>
              <option value="15">15s</option>
              <option value="20">20s</option>
              <option value="30">30s</option>
              <option value="45">45s</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
          </div>
          <span className="text-sm text-zinc-300">Next in {countdown}s</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/10 p-2 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onPickMusic(file);
            event.currentTarget.value = "";
          }}
        />
        <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-1 h-3.5 w-3.5" />
          Load Music
        </Button>
        <span className="text-sm text-zinc-300">{ambientTrackLabel}</span>
      </div>

      <div className="mt-2 rounded-xl border border-white/10 bg-black/10 p-2">
        <p className="text-xs font-medium text-zinc-300">Music Apps</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={spotifyConnected ? "default" : "outline"}
            className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10"
            onClick={onConnectSpotify}
          >
            {spotifyConnected ? "Spotify Connected" : "Connect Spotify"}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={onOpenSpotify}>
            Spotify
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={onOpenYouTubeMusic}>
            YouTube Music
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={onOpenGaana}>
            Gaana
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-400">{musicAppStatus}</p>
      </div>
      </div>
    </Card>
  );
}
