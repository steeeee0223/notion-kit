import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSubItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

export function CommandNested() {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState({ curr: "", prev: "" });

  const [openProjects, setOpenProjects] = useState(false);

  return (
    <Command
      className="w-[450px] rounded-lg border shadow-md"
      onKeyDown={(e) => {
        // Escape goes to previous page
        // Backspace goes to previous page when search is empty
        if (
          e.key === "Escape" ||
          (e.key === "Backspace" && !search) ||
          (e.key === "ArrowLeft" && !search)
        ) {
          e.preventDefault();
          setPages((v) => ({ curr: v.prev, prev: "" }));
          setOpenProjects(false);
        }
        if (e.key === "ArrowRight" && !search) {
          e.preventDefault();
          // setPages((v) => ({ curr: "projects", prev: v.curr }));
        }
      }}
    >
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Type a command or search..."
      />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {!pages.curr && (
          <CommandGroup heading="Suggestions">
            <Popover open={openProjects} onOpenChange={setOpenProjects}>
              <PopoverTrigger asChild>
                <CommandItem
                  onSelect={() => {
                    setPages((v) => ({ curr: "projects", prev: v.curr }));
                  }}
                  onPointerEnter={() => setOpenProjects(true)}
                  // onPointerLeave={() => setOpenProjects(false)}
                >
                  Search projects…
                </CommandItem>
              </PopoverTrigger>
              <PopoverContent side="right" align="start">
                <CommandGroup heading="Projects">
                  <CommandItem>Project A</CommandItem>
                  <CommandItem>Project B</CommandItem>
                </CommandGroup>
              </PopoverContent>
            </Popover>
            <CommandItem
              onSelect={() =>
                setPages((v) => ({ curr: "teams", prev: v.curr }))
              }
            >
              Join a team…
            </CommandItem>
          </CommandGroup>
        )}

        {pages.curr === "projects" && (
          <CommandGroup heading="Projects">
            <CommandItem>Project A</CommandItem>
            <CommandItem>Project B</CommandItem>
          </CommandGroup>
        )}

        {pages.curr === "teams" && (
          <CommandGroup heading="Teams">
            <CommandItem>Team 1</CommandItem>
            <CommandItem>Team 2</CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
