"use client";

import { useEffect, useState } from "react";

import { useInputField } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { Icon } from "@notion-kit/icons";
import { Button, Input, TooltipPreset } from "@notion-kit/shadcn";

import type { Column } from "../lib/types";
import { CellPlugin } from "../plugins";
import { UpdateColumnPayload } from "../table-contexts";
import { DefaultIcon } from "./default-icon";

interface PropMetaProps<TPlugin extends CellPlugin = CellPlugin> {
  property: Pick<Column<TPlugin>, "type" | "icon" | "name" | "description">;
  validateName: (value: string) => boolean;
  onUpdate: (data: Omit<UpdateColumnPayload<TPlugin>, "width">) => void;
}

export const PropMeta: React.FC<PropMetaProps> = ({
  property,
  validateName,
  onUpdate,
}) => {
  const [showDesc, setShowDesc] = useState(false);
  const toggleDesc = () => setShowDesc((prev) => !prev);

  const nameField = useInputField({
    id: "name",
    initialValue: property.name,
    validate: validateName,
    onUpdate: (name) => onUpdate({ name }),
  });
  const descField = useInputField({
    id: "description",
    initialValue: property.description ?? "",
    onUpdate: (description) => onUpdate({ description }),
  });
  /** Icon */
  const uploadIcon = (file: File) => {
    // TODO impl. this
    onUpdate({ icon: { type: "url", src: URL.createObjectURL(file) } });
  };

  useEffect(() => {
    if (showDesc) descField.ref.current?.focus();
  }, [descField.ref, showDesc]);

  return (
    <>
      <div className="flex flex-col gap-px pt-3 pb-1">
        <div className="flex min-h-7 w-full items-center select-none">
          <div className="mr-auto ml-3 min-w-0 shrink-0">
            <IconMenu
              className="box-border size-7 animate-bg-in rounded-md border border-border"
              onSelect={(icon) => onUpdate({ icon })}
              onRemove={() => onUpdate({ icon: null })}
              onUpload={uploadIcon}
            >
              {property.icon ? (
                <IconBlock icon={property.icon} className="size-3.5 p-0" />
              ) : (
                <DefaultIcon type={property.type} />
              )}
            </IconMenu>
          </div>
          <div className="mr-3 ml-1.5 min-w-0 flex-auto">
            <div className="flex">
              <Input
                {...nameField.props}
                endIcon={
                  <TooltipPreset
                    side="top"
                    description="Add property description"
                    className="z-999"
                  >
                    <Button
                      tabIndex={0}
                      variant="close"
                      className="ml-1 grow-0"
                      onClick={toggleDesc}
                    >
                      <Icon.InfoFilled className="fill-default/45 hover:fill-icon" />
                    </Button>
                  </TooltipPreset>
                }
              />
            </div>
          </div>
        </div>
        {nameField.error && (
          <div className="mx-4 pt-2 text-sm text-red">
            A property named {nameField.props.value} already exists in this
            database.
          </div>
        )}
      </div>
      {showDesc && (
        <div className="flex min-h-7 w-full min-w-0 flex-auto items-center px-3 py-1 leading-[1.2] select-none">
          <Input
            className="h-auto text-[13px]/[20px]"
            placeholder="Add a description..."
            {...descField.props}
          />
        </div>
      )}
    </>
  );
};
