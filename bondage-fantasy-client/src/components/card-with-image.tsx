import { Card } from "@mantine/core";
import { ImageWithPlaceholder } from "./image-with-placeholder";

export function CardWithImage(props: {
  image?: File | string;
  children: React.ReactNode;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-32">
      <div className="flex">
        <div className="-my-lg -ml-lg mr-md">
          <div className="h-32 w-32">
            <ImageWithPlaceholder image={props.image} />
          </div>
        </div>
        <div className="flex-1">{props.children}</div>
      </div>
    </Card>
  );
}
