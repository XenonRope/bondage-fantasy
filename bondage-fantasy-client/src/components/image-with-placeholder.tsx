import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useAppStore } from "../store";

export function ImageWithPlaceholder(props: { image?: File | string }) {
  const [imageUrl, setImageUrl] = useState<string>();
  const config = useAppStore((state) => state.config);
  useEffect(() => {
    if (!props.image) {
      setImageUrl(undefined);
      return;
    }
    if (typeof props.image === "string") {
      if (config) {
        setImageUrl(config.filesUrl + props.image);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(props.image);
    setImageUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [props.image, config]);

  if (imageUrl) {
    return <img src={imageUrl} className="h-full w-full object-contain" />;
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-200">
      <FontAwesomeIcon icon={faImage} className="h-1/2 text-gray-400" />
    </div>
  );
}
