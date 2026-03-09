"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuidedAudioCard } from "@/components/feature/guided-audio-card";
import { useAppStore } from "../../../state/store";
import type { YogaPose } from "@/lib/types";
import { yogaPoseCatalog } from "@/lib/workout-yoga-catalog";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SCOPES = ["user-read-email"];

export default function YogaPracticePage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const exercises = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category === "yoga");
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDurationSec, setStepDurationSec] = useState(20);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(20);
  const [voiceRate, setVoiceRate] = useState(1);
  const [guidePlaying, setGuidePlaying] = useState(false);
  const [ambientTrackLabel, setAmbientTrackLabel] = useState("No music loaded");
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [musicAppStatus, setMusicAppStatus] = useState("Open a music app to play matching tracks manually.");
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const guideTimeoutRef = useRef<number | null>(null);
  const guidePlayingRef = useRef(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientObjectUrlRef = useRef<string | null>(null);

  const current = useMemo(() => exercises.find((item) => item.id === id) ?? exercises[0], [exercises, id]);
  const poseInfo = yogaPoseCatalog.find((pose: YogaPose) => pose.name === current?.name);
  const youtubeEmbedUrl = useMemo(() => {
    if (current?.youtubeId) return `https://www.youtube.com/embed/${current.youtubeId}`;
    if (poseInfo?.youtubeId) return `https://www.youtube.com/embed/${poseInfo.youtubeId}`;
    return current?.youtubeUrl ?? poseInfo?.youtubeUrl;
  }, [current?.youtubeId, current?.youtubeUrl, poseInfo?.youtubeId, poseInfo?.youtubeUrl]);
  const youtubeWatchUrl = useMemo(() => {
    if (current?.youtubeId) return `https://www.youtube.com/watch?v=${current.youtubeId}`;
    if (poseInfo?.youtubeId) return `https://www.youtube.com/watch?v=${poseInfo.youtubeId}`;
    const source = current?.youtubeUrl ?? poseInfo?.youtubeUrl;
    if (!source) return undefined;
    if (source.includes("/embed/")) {
      return source.replace("/embed/", "/watch?v=");
    }
    return source;
  }, [current?.youtubeId, current?.youtubeUrl, poseInfo?.youtubeId, poseInfo?.youtubeUrl]);
  const currentSteps = current?.steps ?? [];
  const currentStep = currentSteps[stepIndex] ?? "";
  const elapsedStepSeconds = stepIndex * stepDurationSec + Math.max(0, stepDurationSec - stepSecondsLeft);
  const totalStepSeconds = currentSteps.length * stepDurationSec;
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const canPlayAmbient = Boolean(ambientAudioRef.current);
  const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  const spotifyRedirectUri =
    (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined)?.trim() ||
    `${window.location.origin}${window.location.pathname}`;
  const guideEnded = currentSteps.length > 0 && !guidePlaying && stepIndex === currentSteps.length - 1 && stepSecondsLeft === 0;
  const playerState = !canSpeak
    ? { label: "No Voice", tone: "muted" as const }
    : guidePlaying
      ? { label: "Playing", tone: "active" as const }
      : guideEnded
        ? { label: "Ended", tone: "default" as const }
        : { label: "Paused", tone: "default" as const };

  const formatClock = (secondsValue: number) => {
    const safe = Math.max(0, Math.floor(secondsValue));
    const minute = Math.floor(safe / 60)
      .toString()
      .padStart(2, "0");
    const second = (safe % 60).toString().padStart(2, "0");
    return `${minute}:${second}`;
  };

  const base64UrlEncode = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const createRandomVerifier = (length = 64) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const random = new Uint8Array(length);
    crypto.getRandomValues(random);
    return Array.from(random)
      .map((value) => chars[value % chars.length])
      .join("");
  };

  const createCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(digest);
  };

  const clearGuideTimeout = () => {
    if (guideTimeoutRef.current === null) return;
    window.clearTimeout(guideTimeoutRef.current);
    guideTimeoutRef.current = null;
  };

  const stopVoice = () => {
    clearGuideTimeout();
    if (canSpeak) {
      window.speechSynthesis.cancel();
    }
    guidePlayingRef.current = false;
    setGuidePlaying(false);
  };

  const speakStepAt = (index: number, onFinished?: () => void) => {
    if (!currentSteps[index]) return;
    if (!canSpeak) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Step ${index + 1}. ${currentSteps[index]}`,
    );
    utterance.rate = voiceRate;
    utterance.onstart = () => {
      setStepIndex(index);
    };
    utterance.onend = () => {
      onFinished?.();
    };
    utterance.onerror = () => {
      onFinished?.();
    };
    window.speechSynthesis.speak(utterance);
  };

  const playGuideFrom = (index: number) => {
    if (!guidePlayingRef.current || index >= currentSteps.length) {
      stopVoice();
      return;
    }

    setStepIndex(index);
    setStepSecondsLeft(stepDurationSec);

    speakStepAt(index, () => {
      if (!guidePlayingRef.current) return;

      const nextIndex = index + 1;
      if (nextIndex >= currentSteps.length) {
        stopVoice();
        return;
      }

      guideTimeoutRef.current = window.setTimeout(() => {
        playGuideFrom(nextIndex);
      }, stepDurationSec * 1000);
    });
  };

  const playGuide = () => {
    if (currentSteps.length === 0) return;
    guidePlayingRef.current = true;
    setStepSecondsLeft(stepDurationSec);
    setGuidePlaying(true);
    playGuideFrom(stepIndex);
  };

  const seekGuideProgress = (value: number) => {
    if (currentSteps.length === 0) return;
    stopVoice();
    const target = Math.round((Math.max(0, Math.min(100, value)) / 100) * (currentSteps.length - 1));
    setStepIndex(target);
    setStepSecondsLeft(stepDurationSec);
  };

  const setGuideStepDuration = (nextDuration: number) => {
    setStepDurationSec(nextDuration);
    setStepSecondsLeft(nextDuration);
    if (guidePlayingRef.current) {
      clearGuideTimeout();
      playGuideFrom(stepIndex);
    }
  };

  const moveStep = (direction: -1 | 1) => {
    stopVoice();
    setStepIndex((prev) => {
      if (direction === -1) return Math.max(0, prev - 1);
      return Math.min(currentSteps.length - 1, prev + 1);
    });
    setStepSecondsLeft(stepDurationSec);
  };

  const handlePickMusic = (file: File) => {
    stopVoice();

    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.src = "";
      ambientAudioRef.current = null;
    }

    if (ambientObjectUrlRef.current) {
      URL.revokeObjectURL(ambientObjectUrlRef.current);
      ambientObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    ambientObjectUrlRef.current = objectUrl;

    const audio = new Audio(objectUrl);
    audio.loop = true;
    audio.volume = 0.25;
    audio.onplay = () => setAmbientPlaying(true);
    audio.onpause = () => setAmbientPlaying(false);
    audio.onended = () => setAmbientPlaying(false);

    ambientAudioRef.current = audio;
    setAmbientTrackLabel(file.name);
    setAmbientPlaying(false);
  };

  const toggleAmbientMusic = () => {
    if (!ambientAudioRef.current) return;
    if (ambientPlaying) {
      ambientAudioRef.current.pause();
      return;
    }
    ambientAudioRef.current.play().catch(() => {
      setAmbientPlaying(false);
    });
  };

  const openMusicApp = (provider: "spotify" | "ytmusic" | "gaana") => {
    const query = encodeURIComponent(`${current?.name ?? "Yoga"} yoga`);
    const targets = {
      spotify: `https://open.spotify.com/search/${query}`,
      ytmusic: `https://music.youtube.com/search?q=${query}`,
      gaana: `https://gaana.com/search/${query}`,
    } as const;

    const opened = window.open(targets[provider], "_blank", "noopener,noreferrer");
    if (opened) {
      setMusicAppStatus(`Opened ${provider === "ytmusic" ? "YouTube Music" : provider === "gaana" ? "Gaana" : "Spotify"}. Playback is controlled in that app.`);
    } else {
      setMusicAppStatus("Popup was blocked. Allow popups and try again.");
    }
  };

  const connectSpotify = async () => {
    if (!spotifyClientId) {
      setMusicAppStatus("Set VITE_SPOTIFY_CLIENT_ID in .env to enable Spotify connect.");
      return;
    }

    const verifier = createRandomVerifier();
    const challenge = await createCodeChallenge(verifier);
    const state = createRandomVerifier(24);
    localStorage.setItem("minefit_spotify_verifier", verifier);
    localStorage.setItem("minefit_spotify_state", state);

    const authParams = new URLSearchParams({
      client_id: spotifyClientId,
      response_type: "code",
      redirect_uri: spotifyRedirectUri,
      code_challenge_method: "S256",
      code_challenge: challenge,
      scope: SPOTIFY_SCOPES.join(" "),
      state,
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${authParams.toString()}`;
  };

  const exchangeSpotifyCode = async (code: string) => {
    if (!spotifyClientId) {
      setMusicAppStatus("Spotify client ID is missing. Set VITE_SPOTIFY_CLIENT_ID.");
      return;
    }

    const verifier = localStorage.getItem("minefit_spotify_verifier");
    if (!verifier) {
      setMusicAppStatus("Spotify verification key missing. Please connect again.");
      return;
    }

    const body = new URLSearchParams({
      client_id: spotifyClientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: spotifyRedirectUri,
      code_verifier: verifier,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      setMusicAppStatus(`Spotify token exchange failed. Verify Redirect URI in Spotify app: ${spotifyRedirectUri}`);
      return;
    }

    const tokenData = await response.json();
    const expiresAt = Date.now() + Number(tokenData.expires_in ?? 0) * 1000;
    localStorage.setItem("minefit_spotify_access_token", tokenData.access_token ?? "");
    localStorage.setItem("minefit_spotify_refresh_token", tokenData.refresh_token ?? "");
    localStorage.setItem("minefit_spotify_expires_at", String(expiresAt));
    localStorage.removeItem("minefit_spotify_verifier");
    localStorage.removeItem("minefit_spotify_state");

    setSpotifyConnected(true);
    setMusicAppStatus("Spotify connected. Use Spotify button to open tracks.");
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("minefit_spotify_access_token");
    const expiresAt = Number(localStorage.getItem("minefit_spotify_expires_at") ?? "0");
    if (accessToken && expiresAt > Date.now()) {
      setSpotifyConnected(true);
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const storedState = localStorage.getItem("minefit_spotify_state");

    if (!code) {
      const authError = params.get("error");
      if (authError) {
        setMusicAppStatus(`Spotify auth error: ${authError}. Expected redirect URI: ${spotifyRedirectUri}`);
      }
      return;
    }

    if (!state || !storedState || state !== storedState) {
      setMusicAppStatus("Spotify state verification failed. Please try connect again.");
      return;
    }

    exchangeSpotifyCode(code).catch(() => {
      setMusicAppStatus("Spotify connect failed. Try again.");
    });

    params.delete("code");
    params.delete("state");
    const cleanSearch = params.toString();
    const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!current) return;
    setStepIndex(0);
    setRunning(false);
    setSeconds(current.duration * 60);
    setStepSecondsLeft(stepDurationSec);
    stopVoice();
  }, [current?.id]);

  useEffect(() => {
    setStepSecondsLeft(stepDurationSec);
  }, [stepDurationSec]);

  useEffect(() => {
    guidePlayingRef.current = guidePlaying;
    if (!guidePlaying) return;
    const timer = window.setInterval(() => {
      setStepSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [guidePlaying, stepIndex]);

  useEffect(() => {
    return () => {
      if (canSpeak) {
        window.speechSynthesis.cancel();
      }
      clearGuideTimeout();
      guidePlayingRef.current = false;

      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = "";
        ambientAudioRef.current = null;
      }

      if (ambientObjectUrlRef.current) {
        URL.revokeObjectURL(ambientObjectUrlRef.current);
        ambientObjectUrlRef.current = null;
      }
    };
  }, [canSpeak]);

  if (!current) {
    return (
      <Card>
        <CardTitle>Yoga Practice</CardTitle>
        <CardDescription className="mt-1">No yoga pose available.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{current.name}</CardTitle>
        <CardDescription className="mt-1">Calm guided yoga mode with breathing support</CardDescription>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Best time: {poseInfo?.bestTime ?? "anytime"} • Duration: {current.duration} min</p>
      </Card>

      <Card>
        <CardTitle>Breathing Technique</CardTitle>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{poseInfo?.breathingTechnique ?? "Inhale slowly through nose and exhale longer."}</p>
      </Card>

      <Card>
        <CardTitle>YouTube Demo</CardTitle>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl">
          {youtubeEmbedUrl ? (
            <iframe
              className="h-full w-full"
              src={youtubeEmbedUrl}
              title={current.name}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">No video available offline</div>
          )}
        </div>
        {youtubeWatchUrl ? (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-emerald-600 hover:underline"
            >
              Open on YouTube
            </a>
          </p>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GuidedAudioCard
          title="Guided Audio"
          subtitle={currentStep || "No step instruction available."}
          isPlaying={guidePlaying}
          stateLabel={playerState.label}
          stateTone={playerState.tone}
          progress={
            currentSteps.length > 0
              ? ((stepIndex + 1) / currentSteps.length) * 100
              : 0
          }
          onSeekProgress={seekGuideProgress}
          elapsedLabel={formatClock(elapsedStepSeconds)}
          totalLabel={formatClock(totalStepSeconds)}
          speed={voiceRate}
          onSpeedChange={setVoiceRate}
          stepTime={stepDurationSec}
          onStepTimeChange={setGuideStepDuration}
          countdown={stepSecondsLeft}
          onPrevious={() => moveStep(-1)}
          onTogglePlay={() => {
            if (guidePlaying) {
              stopVoice();
              return;
            }
            playGuide();
          }}
          onNext={() => moveStep(1)}
          onStop={stopVoice}
          ambientPlaying={ambientPlaying}
          ambientTrackLabel={ambientTrackLabel}
          onToggleAmbient={toggleAmbientMusic}
          onPickMusic={handlePickMusic}
          onOpenSpotify={() => openMusicApp("spotify")}
          onConnectSpotify={connectSpotify}
          spotifyConnected={spotifyConnected}
          onOpenYouTubeMusic={() => openMusicApp("ytmusic")}
          onOpenGaana={() => openMusicApp("gaana")}
          musicAppStatus={musicAppStatus}
          controlsDisabled={currentSteps.length === 0 || (!canSpeak && !canPlayAmbient)}
        />

        <Card>
          <CardTitle>Pose Steps</CardTitle>
          <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Step {Math.min(stepIndex + 1, Math.max(1, currentSteps.length))} of {currentSteps.length}
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
            {current.steps.map((step, idx) => (
              <li key={`${current.id}-${idx}`} className={idx === stepIndex ? "font-semibold text-emerald-600" : ""}>
                {step}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>Pose Timer</CardTitle>
        <p className="mt-3 text-center text-4xl font-bold">{Math.floor(seconds / 60).toString().padStart(2, "0")}:{(seconds % 60).toString().padStart(2, "0")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button onClick={() => setRunning(true)}>Start</Button>
          <Button variant="secondary" onClick={() => setRunning(false)}>Pause</Button>
          <Button
            variant="outline"
            onClick={() => {
              setRunning(false);
              setSeconds((poseInfo?.duration ?? current.duration ?? 3) * 60);
            }}
          >
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}
