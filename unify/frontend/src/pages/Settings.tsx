import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => (
  <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start gap-3">
        <SettingsIcon className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold">Account settings are not connected</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Preferences and account details will appear here after a settings API is configured. No placeholder values are shown or saved locally.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Settings;
