import { Settings, Sliders, Eye, Zap, RefreshCw } from "lucide-react";
import { HelixSettings } from "../types";

interface ControlHUDProps {
  settings: HelixSettings;
  onUpdateSettings: (settings: HelixSettings) => void;
  activeThemeColor: string;
}

const DEFAULT_SETTINGS: HelixSettings = {
  radius: 2.0,
  verticalGap: 0.5,
  angleGap: 0.85,
  autoScrollSpeed: 0.002,
  focusMode: true,
  bowingStrength: 1.0,
  scrollSpeedLag: 1.0,
};

export default function ControlHUD({
  settings,
  onUpdateSettings,
  activeThemeColor,
}: ControlHUDProps) {
  const handleChange = (key: keyof HelixSettings, value: number | boolean) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
  };

  return (
    <div
      id="control-hud-panel"
      className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 w-full md:w-80 text-white shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: activeThemeColor }} />
          <h3 className="font-sans font-semibold tracking-wider uppercase text-xs text-white">
            Helix Dynamics Lab
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-1 hover:bg-white/10 rounded transition text-neutral-400 hover:text-white"
          title="Reset Physics Configuration"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Settings */}
      <div className="space-y-4 font-mono text-xs text-neutral-300">
        {/* Helix Radius */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>HELIX_RADIUS</span>
            <span style={{ color: activeThemeColor }}>{settings.radius.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="3.5"
            step="0.05"
            value={settings.radius}
            onChange={(e) => handleChange("radius", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Vertical Gap */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>VERTICAL_PITCH</span>
            <span style={{ color: activeThemeColor }}>{settings.verticalGap.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="1.2"
            step="0.05"
            value={settings.verticalGap}
            onChange={(e) => handleChange("verticalGap", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Angular Gap */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>ANGULAR_GAP</span>
            <span style={{ color: activeThemeColor }}>{settings.angleGap.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.8"
            step="0.05"
            value={settings.angleGap}
            onChange={(e) => handleChange("angleGap", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Auto Scroll Speed */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>AUTO_SCROLL_SPEED</span>
            <span style={{ color: activeThemeColor }}>
              {(settings.autoScrollSpeed * 1000).toFixed(1)}m/s
            </span>
          </div>
          <input
            type="range"
            min="0.0005"
            max="0.008"
            step="0.0005"
            value={settings.autoScrollSpeed}
            onChange={(e) => handleChange("autoScrollSpeed", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Bowing Strength */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>BOWING_DEFORMATION</span>
            <span style={{ color: activeThemeColor }}>{settings.bowingStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={settings.bowingStrength}
            onChange={(e) => handleChange("bowingStrength", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Scroll Lag Weight */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>SCROLL_MOMENTUM_LAG</span>
            <span style={{ color: activeThemeColor }}>{settings.scrollSpeedLag.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={settings.scrollSpeedLag}
            onChange={(e) => handleChange("scrollSpeedLag", parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: activeThemeColor }}
          />
        </div>

        {/* Focus Mode Toggle */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] tracking-wider uppercase font-semibold">
              Focus Depth Shader
            </span>
          </div>
          <button
            onClick={() => handleChange("focusMode", !settings.focusMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
              settings.focusMode ? "" : "bg-white/10"
            }`}
            style={{ backgroundColor: settings.focusMode ? activeThemeColor : undefined }}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${
                settings.focusMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
