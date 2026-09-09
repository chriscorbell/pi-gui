import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { bridge } from "@/lib/bridge";
import { Field, Select, Sheet, Switch } from "@/components/ui";

export function SettingsSheet() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const [located, setLocated] = useState<string | null>(null);
  const [piPath, setPiPath] = useState(settings.piPath ?? "");

  useEffect(() => {
    if (!open) return;
    setPiPath(settings.piPath ?? "");
    void bridge.pi.locate().then(setLocated);
  }, [open, settings.piPath]);

  return (
    <Sheet open={open} onOpenChange={setOpen} title="Settings">
      <div className="divide-y divide-border">
        <Field label="Appearance">
          <Select
            value={settings.theme}
            onChange={(v) => void update({ theme: v })}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Field>
        <Field label="Expand thinking by default" hint="Collapsed blocks show a single line until clicked.">
          <Switch checked={settings.thinkingExpanded} onCheckedChange={(v) => void update({ thinkingExpanded: v })} />
        </Field>
        <Field label="Sounds" hint="A chime when a turn ends unseen, a ping when pi needs input.">
          <Switch checked={!settings.muted} onCheckedChange={(v) => void update({ muted: !v })} />
        </Field>
        <Field label="Diff layout">
          <Select
            value={settings.diffStyle}
            onChange={(v) => void update({ diffStyle: v })}
            options={[
              { value: "unified", label: "Unified" },
              { value: "split", label: "Split" },
            ]}
          />
        </Field>
        <div className="py-2.5">
          <div className="text-[14px]">pi binary</div>
          <div className="mb-2 text-[12.5px] text-fg-muted">{located ? `Found at ${located}` : "Not found on PATH. Enter the full path."}</div>
          <input
            value={piPath}
            onChange={(e) => setPiPath(e.target.value)}
            onBlur={() => void update({ piPath: piPath.trim() || null })}
            placeholder="/opt/homebrew/bin/pi"
            className="h-8 w-full rounded-md border border-border-strong bg-bg-sunken px-2 font-mono text-[13px] text-fg placeholder:text-fg-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
        </div>
      </div>
    </Sheet>
  );
}
