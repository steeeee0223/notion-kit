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
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface VerticalDndProps extends React.PropsWithChildren {
  items: string[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function VerticalDnd({ items, children, onDragEnd }: VerticalDndProps) {
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
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
