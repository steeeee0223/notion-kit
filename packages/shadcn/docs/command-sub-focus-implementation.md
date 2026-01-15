# CommandSub Focus Management Implementation Plan

## Problem Summary
1. Focus is always on CommandInput (cmdk behavior)
2. Keyboard events on CommandSubTrigger don't fire
3. Need to detect when CommandSubTrigger is "selected" (aria-selected)
4. Need to move focus into/out of CommandSubContent
5. Only one floating CommandSub should be open at sibling level

## Solution Architecture

### 1. Enhanced Context
```tsx
interface CommandSubContextValue {
  id: string;  // unique ID for coordination
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "inline" | "floating";
  contentRef: React.RefObject<HTMLDivElement>;  // for focus management
  triggerRef: React.RefObject<HTMLDivElement>;  // for aria-selected detection
}

interface CommandSubGroupContextValue {
  openSubId: string | null;  // track which sibling is open
  setOpenSubId: (id: string | null) => void;
}
```

### 2. CommandGroup Enhancement
Wrap children in CommandSubGroupContext to coordinate siblings:
```tsx
function CommandGroup({ children, ...props }) {
  const [openSubId, setOpenSubId] = React.useState<string | null>(null);
  const groupValue = React.useMemo(
    () => ({ openSubId, setOpenSubId }),
    [openSubId]
  );

  return (
    <CommandPrimitive.Group {...props}>
      <CommandSubGroupContext.Provider value={groupValue}>
        {children}
      </CommandSubGroupContext.Provider>
    </CommandPrimitive.Group>
  );
}
```

### 3. CommandSub Updates
- Generate unique ID
- Create refs for trigger and content
- Coordinate with sibling group
- Close siblings when opening (floating only)

### 4. CommandSubTrigger Updates
- Store ref for aria-selected detection
- Remove keyboard handlers (won't work - focus is on input)
- Add data-command-sub-trigger attribute for detection

### 5. Command/CommandInput Enhancement
Add global keyboard handler:
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  const selectedItem = document.querySelector('[cmdk-item][aria-selected="true"]');
  
  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    const trigger = selectedItem?.closest('[data-command-sub-trigger]');
    if (trigger) {
      // Open sub and move focus into content
      const subId = trigger.getAttribute('data-sub-id');
      // ... open logic and focus management
    }
  }

  if (e.key === 'ArrowLeft' || e.key === 'Escape') {
    const activeElement = document.activeElement;
    if (activeElement && isWithinCommandSubContent(activeElement)) {
      // Close sub and move focus back
      // ...
    }
  }
};
```

### 6. Focus Management Utilities
```tsx
function focusFirstInSubContent(contentRef: React.RefObject<HTMLDivElement>) {
  const firstItem = contentRef.current?.querySelector('[cmdk-item]');
  if (firstItem instanceof HTMLElement) {
    firstItem.focus();
  }
}

function focusCommandInput() {
  const input = document.querySelector('[cmdk-input]');
  if (input instanceof HTMLElement) {
    input.focus();
  }
}
```

## Implementation Steps
1. ✅ Update contexts (DONE)
2. Update CommandGroup to provide group context
3. Update CommandSub with full implementation
4. Update CommandSubTrigger to use refs
5. Add keyboard handler to Command
6. Update CommandSubContent to handle focus
7. Test all scenarios

## Key Behaviors

### Opening a Sub-menu
1. User navigates to CommandSubTrigger (aria-selected=true)
2. User presses ArrowRight or Enter
3. System:
   - Closes sibling subs (if floating)
   - Opens the sub
   - Moves focus to first item in CommandSubContent

### Closing a Sub-menu
1. Focus is within CommandSubContent
2. User presses ArrowLeft or Escape
3. System:
   - Closes the sub
   - Returns focus to CommandInput (or parent sub's first item)

### Sibling Coordination (Floating Only)
1. CommandSub1 is open
2. User opens CommandSub2
3. System:
   - CommandSub1 automatically closes
   - CommandSub2 opens
   - Only one floating sub open at a time per level
