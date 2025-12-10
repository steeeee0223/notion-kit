"use client";

import React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface VerticalDndProps extends React.PropsWithChildren {
  items: string[];
  orientation?: "vertical" | "horizontal";
  sensors?: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function VerticalDnd({
  items,
  orientation = "vertical",
  children,
  ...props
}: VerticalDndProps) {
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[
        restrictToParentElement,
        orientation === "vertical"
          ? restrictToVerticalAxis
          : restrictToHorizontalAxis,
      ]}
      {...props}
    >
      <SortableContext
        items={items}
        strategy={
          orientation === "vertical"
            ? verticalListSortingStrategy
            : horizontalListSortingStrategy
        }
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function useDndSensors() {
  const pointer = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const mouse = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touch = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 },
  });
  const keyboard = useSensor(KeyboardSensor, {});

  return useSensors(pointer, mouse, touch, keyboard);
}
