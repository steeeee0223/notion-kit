import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@notion-kit/shadcn";

export function CommandDefault() {
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
        <CommandGroup heading="Settings">
          <CommandItem>👤 Profile</CommandItem>
          <CommandItem>💳 Billing</CommandItem>
          <CommandItem>⚙️ Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
