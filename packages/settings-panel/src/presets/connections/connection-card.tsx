"use client";

import { useTranslation } from "@notion-kit/i18n";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@notion-kit/shadcn";

export interface ConnectionCardProps {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  isConnecting?: boolean;
  onConnect?: () => Promise<void>;
}

export const ConnectionCard = ({
  id,
  imageUrl,
  title,
  description,
  tags,
  isConnecting,
  onConnect,
}: ConnectionCardProps) => {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("my-connections.discover.buttons.connect");

  return (
    <Card
      asButton
      className="flex min-w-[120px] flex-col justify-between gap-3 overflow-hidden p-3"
    >
      <CardContent className="flex flex-col items-start gap-2">
        <CardHeader className="px-0 py-1">
          <img src={imageUrl} alt={id} className="size-7 rounded-md" />
        </CardHeader>
        <CardTitle className="text-sm/[1.3] font-medium">{title}</CardTitle>
        <CardDescription className="max-h-[72px] overflow-hidden text-xs/[1.3] text-secondary">
          {description}
        </CardDescription>
        <div className="flex gap-1">
          {tags.map((tag, i) => (
            <Badge
              key={i}
              variant="gray"
              size="sm"
              className="cursor-default uppercase"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Button
          variant="soft-blue"
          size="sm"
          className="h-7 w-full"
          disabled={isConnecting}
          onClick={onConnect}
        >
          {trans}
        </Button>
      </CardFooter>
    </Card>
  );
};
