import { useState, useCallback, useEffect } from "react";
import { isMobileSafari, isIOS, isChrome } from "react-device-detect";

export const triggerFullscreen = () => {
  const methods = [
    "requestFullscreen",
    "webkitRequestFullscreen",
    "webkitRequestFullScreen",
    "mozRequestFullScreen",
    "msRequestFullscreen",
  ];

  const ref = document.documentElement;
  if (ref) {
    for (const name of methods) {
      if (name in ref) {
        ref[name]?.()?.catch((err) => {
          console.error("Fullscreen error:", err);
        });
        ref.style.overflowY = "auto";
        break;
      }
    }
  }
};

export function useFullScreenDetection({ disabled = false } = {}) {
  const [fullScreenStatus, setFullScreenStatus] = useState("pending");
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);

  const changeFullscreenStatus = useCallback(() => {
    const isFullScreenNow =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    setFullScreenStatus(isFullScreenNow ? "on" : "off");

    // Prevents accidental exit only if fullscreen is enabled
    if (isFullscreenEnabled && !isFullScreenNow) {
      console.warn("User attempted to exit fullscreen!");
      setTimeout(triggerFullscreen, 100);
    }
  }, [isFullscreenEnabled]);

  const preventFullscreenExit = useCallback((e) => {
    if (["F11", "Escape"].includes(e.key)) {
      e.preventDefault();
      console.warn("Blocked fullscreen exit attempt!");
      triggerFullscreen();
    }
  }, []);

  // Enable Fullscreen Mode
  const enableFullscreenMode = () => {
    setIsFullscreenEnabled(true);
    triggerFullscreen();
  };

  // Disable Fullscreen Mode (Used after test submission)
  const disableFullscreenMode = () => {
    setIsFullscreenEnabled(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) =>
        console.warn("Error exiting fullscreen:", err)
      );
    }
  };

  useEffect(() => {
    if (disabled || isFullscreenEnabled === false) return;

    changeFullscreenStatus();

    document.addEventListener("fullscreenchange", changeFullscreenStatus);
    document.addEventListener("keydown", preventFullscreenExit);
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? Your test will be terminated.";
    });

    return () => {
      document.removeEventListener("fullscreenchange", changeFullscreenStatus);
      document.removeEventListener("keydown", preventFullscreenExit);
      window.removeEventListener("beforeunload", () => {});
    };
  }, [disabled, isFullscreenEnabled]);

  return { fullScreenStatus, enableFullscreenMode, disableFullscreenMode };
}

