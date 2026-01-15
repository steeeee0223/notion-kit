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

export function CommandSubDemo() {
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

        <CommandGroup heading="Navigation">
          {/* Basic Sub-menu */}
          <CommandSub>
            <CommandSubTrigger>⚙️ Settings</CommandSubTrigger>
            <CommandSubContent>
              <CommandItem>👤 Profile</CommandItem>
              <CommandItem>💳 Billing</CommandItem>
              <CommandItem>🔔 Notifications</CommandItem>
              <CommandItem>🔐 Privacy</CommandItem>

              {/* Nested Sub-menu */}
              <CommandSub>
                <CommandSubTrigger>🔧 Advanced</CommandSubTrigger>
                <CommandSubContent>
                  <CommandItem>🛠️ Developer Tools</CommandItem>
                  <CommandItem>🚩 Feature Flags</CommandItem>
                  <CommandItem>🧪 Experimental</CommandItem>
                  <CommandItem>🐛 Debug Mode</CommandItem>
                </CommandSubContent>
              </CommandSub>
            </CommandSubContent>
          </CommandSub>

          {/* Sub-menu with defaultOpen */}
          <CommandSub defaultOpen>
            <CommandSubTrigger>👥 Team</CommandSubTrigger>
            <CommandSubContent>
              <CommandItem>➕ Invite User</CommandItem>
              <CommandItem>👨‍👩‍👧‍👦 Manage Members</CommandItem>
              <CommandItem>⚙️ Team Settings</CommandItem>
              <CommandItem>📊 Analytics</CommandItem>
            </CommandSubContent>
          </CommandSub>

          {/* Another Sub-menu */}
          <CommandSub>
            <CommandSubTrigger>📁 Workspace</CommandSubTrigger>
            <CommandSubContent>
              <CommandItem>📄 New Page</CommandItem>
              <CommandItem>📋 Templates</CommandItem>
              <CommandItem>🗑️ Trash</CommandItem>

              {/* Nested Sub-menu in Workspace */}
              <CommandSub>
                <CommandSubTrigger>📤 Import</CommandSubTrigger>
                <CommandSubContent>
                  <CommandItem>📝 Markdown</CommandItem>
                  <CommandItem>📊 CSV</CommandItem>
                  <CommandItem>📄 Word</CommandItem>
                  <CommandItem>🌐 HTML</CommandItem>
                </CommandSubContent>
              </CommandSub>

              <CommandSub>
                <CommandSubTrigger>📥 Export</CommandSubTrigger>
                <CommandSubContent>
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
