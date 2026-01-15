import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandSub,
  CommandSubContent,
  CommandSubTrigger,
} from "@notion-kit/shadcn";

export function CommandSubFloating() {
  return (
    <Command className="w-[450px] rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>📅 Calendar</CommandItem>
          <CommandItem>😀 Search Emoji</CommandItem>
          <CommandItem>🧮 Calculator</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation (Floating Sub-menus)">
          {/* Floating Sub-menu */}
          <CommandSub>
            <CommandSubTrigger>⚙️ Settings</CommandSubTrigger>
            <CommandSubContent variant="floating">
              <CommandItem>👤 Profile</CommandItem>
              <CommandItem>💳 Billing</CommandItem>
              <CommandItem>🔔 Notifications</CommandItem>
              <CommandItem>🔐 Privacy</CommandItem>

              {/* Nested Floating Sub-menu */}
              <CommandSub>
                <CommandSubTrigger>🔧 Advanced</CommandSubTrigger>
                <CommandSubContent variant="floating">
                  <CommandItem>🛠️ Developer Tools</CommandItem>
                  <CommandItem>🚩 Feature Flags</CommandItem>
                  <CommandItem>🧪 Experimental</CommandItem>
                  <CommandItem>🐛 Debug Mode</CommandItem>
                </CommandSubContent>
              </CommandSub>
            </CommandSubContent>
          </CommandSub>

          {/* Floating Sub-menu with defaultOpen */}
          <CommandSub defaultOpen>
            <CommandSubTrigger>👥 Team</CommandSubTrigger>
            <CommandSubContent variant="floating">
              <CommandItem>➕ Invite User</CommandItem>
              <CommandItem>👨‍👩‍👧‍👦 Manage Members</CommandItem>
              <CommandItem>⚙️ Team Settings</CommandItem>
              <CommandItem>📊 Analytics</CommandItem>
            </CommandSubContent>
          </CommandSub>

          {/* Floating Sub-menu with multiple nested sub-menus */}
          <CommandSub>
            <CommandSubTrigger>📁 Workspace</CommandSubTrigger>
            <CommandSubContent variant="floating">
              <CommandItem>📄 New Page</CommandItem>
              <CommandItem>📋 Templates</CommandItem>
              <CommandItem>🗑️ Trash</CommandItem>

              {/* Nested Floating Sub-menu in Workspace */}
              <CommandSub>
                <CommandSubTrigger>📤 Import</CommandSubTrigger>
                <CommandSubContent variant="floating">
                  <CommandItem>📝 Markdown</CommandItem>
                  <CommandItem>📊 CSV</CommandItem>
                  <CommandItem>📄 Word</CommandItem>
                  <CommandItem>🌐 HTML</CommandItem>
                </CommandSubContent>
              </CommandSub>

              <CommandSub>
                <CommandSubTrigger>📥 Export</CommandSubTrigger>
                <CommandSubContent variant="floating">
                  <CommandItem>📝 Markdown</CommandItem>
                  <CommandItem>📄 PDF</CommandItem>
                  <CommandItem>🌐 HTML</CommandItem>
                </CommandSubContent>
              </CommandSub>
            </CommandSubContent>
          </CommandSub>

          <CommandItem>🔍 Search</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem>📖 Documentation</CommandItem>
          <CommandItem>💬 Support</CommandItem>
          <CommandItem>🐙 GitHub</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
