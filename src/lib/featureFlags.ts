import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from "firebase/remote-config";
import { initializeApp, getApps } from "firebase/app";

let remoteConfig: RemoteConfig | null = null;
let flagsReady = false;

const DEFAULT_FLAGS = {
  enable_profile_booster_quiz_feature: false,
};

export type FeatureFlag = keyof typeof DEFAULT_FLAGS;

export const initFeatureFlags = async (): Promise<void> => {
  try {
    const app = getApps()[0];
    if (!app) return;

    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 60 * 60 * 1000; // 1 hour cache
    remoteConfig.defaultConfig = DEFAULT_FLAGS;

    await fetchAndActivate(remoteConfig);
    flagsReady = true;
    console.log("[FeatureFlags] Remote Config fetched and activated");
  } catch (error) {
    console.warn("[FeatureFlags] Failed to fetch Remote Config, using defaults:", error);
    flagsReady = false;
  }
};

export const getFeatureFlag = (flag: FeatureFlag): boolean => {
  if (!remoteConfig || !flagsReady) {
    return DEFAULT_FLAGS[flag];
  }
  try {
    return getValue(remoteConfig, flag).asBoolean();
  } catch {
    return DEFAULT_FLAGS[flag];
  }
};

export const isProfileBoosterQuizEnabled = (): boolean => {
  return getFeatureFlag("enable_profile_booster_quiz_feature");
};
