import type React from "react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

const isIOS = () => {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

const isInStandAloneMode = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!(navigator as SafariNavigator).standalone
  );
};

const InstallPWA: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [manualInstallInfo, setManualInstallInfo] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isInStandAloneMode()) return;

    const onBeforePrompt = (e: Event) => {
      e.preventDefault();

      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforePrompt);

    if (!("onbeforeinstallprompt" in window)) {
      if (isIOS()) {
        setManualInstallInfo(
          'On iOS, tap the Share icon in Safari and select "Add to Home Screen".'
        );
      } else {
        setManualInstallInfo(
          'To install this app, use your browser’s menu and select "Add to Home Screen".'
        );
      }
      setShowInstallPrompt(true);
    }

    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center">
      <div className="border border-gray-300 p-4 bg-white rounded-md">
        {manualInstallInfo ? (
          <p>{manualInstallInfo}</p>
        ) : (
          <button onClick={handleInstallClick}>Install App</button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
