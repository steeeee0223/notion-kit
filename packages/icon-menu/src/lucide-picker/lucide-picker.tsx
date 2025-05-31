"use client";

import React, { memo, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { COLOR } from "@notion-kit/common";
import type { LucideName } from "@notion-kit/icon-block";
import { createLucideIcon } from "@notion-kit/icon-block";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { MenuSearchBar, MenuSectionTitle } from "../_components";
import { ColorPicker } from "./color-picker";
import { useLucideIcons } from "./use-lucide-icons";

interface IconProps {
  onClick: (name: LucideName) => void;
  name: LucideName;
  color: string;
}

const Icon: React.FC<IconProps> = ({ name, color, onClick }) => {
  const LucideIcon = useMemo(() => createLucideIcon(name), [name]);
  return (
    <TooltipPreset side="top" description={name}>
      <Button
        variant="hint"
        onClick={() => onClick(name)}
        className="size-[30px] p-0"
      >
        <LucideIcon color={color} size={20} strokeWidth={2.2} />
      </Button>
    </TooltipPreset>
  );
};

interface LucidePickerProps {
  onSelect: (name: LucideName, color: string) => void;
}

export const LucidePicker: React.FC<LucidePickerProps> = memo(
  ({ onSelect }) => {
    const {
      isLoading,
      search,
      color,
      icons,
      recentIcons,
      setColor,
      filterIcons,
      selectIcon,
      getRandomIcon,
    } = useLucideIcons({ onSelect });

    return (
      <div>
        <MenuSearchBar
          search={search}
          onSearchChange={filterIcons}
          onRandomSelect={getRandomIcon}
          Palette={
            <ColorPicker palette={COLOR} value={color} onSelect={setColor} />
          }
        />
        <TooltipProvider delayDuration={500}>
          <div className="mt-0 py-1.5">
            {isLoading ? (
              <Spinner className="mx-1 my-2" />
            ) : icons.length ? (
              <InfiniteScroll
                dataLength={icons.length}
                next={() => console.log("fetching next")}
                hasMore={false}
                height={240}
                loader={null}
                className="-mr-3 notion-scrollbar"
              >
                {search === "" && recentIcons.length > 0 && (
                  <>
                    <MenuSectionTitle title="Recent" />
                    <div className="grid grid-cols-12 gap-0">
                      {recentIcons.map((name, i) => (
                        <Icon
                          key={i}
                          name={name}
                          color={color}
                          onClick={selectIcon}
                        />
                      ))}
                    </div>
                  </>
                )}
                <MenuSectionTitle title="Icons" />
                <div className="grid grid-cols-12 gap-0">
                  {icons.map((name, i) => (
                    <Icon
                      key={i}
                      name={name}
                      color={color}
                      onClick={selectIcon}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <MenuSectionTitle title="No results" />
            )}
          </div>
        </TooltipProvider>
      </div>
    );
  },
);
