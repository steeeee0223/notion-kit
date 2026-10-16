import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  MenuItemSelect,
  toast,
} from "@notion-kit/ui/primitives";

interface MenuHeaderProps {
  id?: string;
  title: string;
  onBack?: () => void;
}

function MenuHeader({ id, title, onBack }: MenuHeaderProps) {
  return (
    <div className="flex h-[42px] shrink-0 items-center px-4 pt-3.5 pb-1.5">
      {onBack !== undefined && (
        <Button
          variant="hint"
          className="mr-2 -ml-0.5 h-[22px] w-6 shrink-0 rounded-md p-0"
          onClick={onBack}
          aria-label="Back"
        >
          <Icon.ArrowLeftThick className="fill-default/45" />
        </Button>
      )}
      <h1 id={id} className="grow truncate text-sm font-semibold">
        {title}
      </h1>
      <Button variant="close" size="circle" aria-label="Close">
        <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
      </Button>
    </div>
  );
}

export default function DropdownMenuInline() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="hint" size="sm">
            Open Menu
          </Button>
        }
      />
      <DropdownMenuContent className="w-60">
        <MenuHeader
          id="view-settings"
          title="View Settings"
          onBack={() => toast("Back")}
        />
        <div className="mx-2 flex">
          <Input
            endIcon={
              <Button tabIndex={0} variant="close" className="ml-1 grow-0">
                <Icon.InfoFilled className="fill-default/45 hover:fill-icon" />
              </Button>
            }
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem icon={<Icon.ViewBoard />} label="Layout">
            <MenuItemSelect>Board</MenuItemSelect>
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon.ArrowUpDown />} label="Sort">
            <MenuItemSelect />
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon.SquareGridBelowLines />} label="Group">
            <MenuItemSelect />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel title="Data source settings" />
          <DropdownMenuItem icon={<Icon.Sliders />} label="Edit properties">
            <MenuItemSelect />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            closeOnClick={false}
            icon={<Icon.Lock />}
            label="Lock database"
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
