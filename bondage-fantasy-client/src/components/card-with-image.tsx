import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "@mantine/core";

export function CardWithImage(props: { children: React.ReactNode }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-32">
      <div className="flex">
        <div className="-my-lg -ml-lg mr-md">
          <div className="h-32 w-32 bg-gray-200 flex items-center justify-center">
            <FontAwesomeIcon icon={faImage} className="h-16 text-gray-400" />
          </div>
        </div>
        <div className="flex-1">{props.children}</div>
      </div>
    </Card>
  );
}
