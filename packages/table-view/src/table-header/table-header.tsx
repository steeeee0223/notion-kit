import { DndTableHeader } from "./table-header-row";

export function TableHeader() {
  return (
    <div className="h-[34px]">
      <div className="w-full" style={{ overflowX: "initial" }}>
        <div className="w-[initial]">
          <div
            data-portal-container="e86cab6b-5fb8-4573-856b-6a12d191ce8c"
            data-is-sticky="false"
            data-sticky-attach-point="ceiling"
          >
            <DndTableHeader />
          </div>
        </div>
      </div>
    </div>
  );
}
