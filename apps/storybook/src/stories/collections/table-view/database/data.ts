import { createMockFullTableFixture } from "@notion-kit/table-hook/mock";
import type {
  DateConfig,
  NumberConfig,
  SelectConfig,
} from "@notion-kit/table-hook/plugins";

const fixture = createMockFullTableFixture();

export const mockProps = fixture.properties;
export const mockData = fixture.data;

export const mockDateConfig = mockProps.find(({ type }) => type === "date")!
  .config as DateConfig;
export const mockNumberConfig = mockProps.find(({ type }) => type === "number")!
  .config as NumberConfig;
export const mockSelectConfig = mockProps.find(({ type }) => type === "select")!
  .config as SelectConfig;
