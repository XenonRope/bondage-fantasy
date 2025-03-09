import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useAppStore } from "../store";

export function ImageWithPlaceholder(props: {
  image?: File | string;
  originalSize?: boolean;
}) {
  const [imageUrl, setImageUrl] = useState<string>();
  const config = useAppStore((state) => state.config);
  useEffect(() => {
    if (!props.image) {
      setImageUrl(undefined);
      return;
    }
    if (typeof props.image === "string") {
      if (
        config &&
        !useAppStore.getState().invalidImageKeys.includes(props.image)
      ) {
        setImageUrl(config.filesUrl + props.image);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(props.image);
    setImageUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [props.image, config]);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        className={`object-contain ${props.originalSize ? "" : "h-full w-full"}`}
        onError={() => {
          if (typeof props.image === "string") {
            useAppStore.getState().addInvalidImageKey(props.image);
          }
          setImageUrl(undefined);
        }}
      />
    );
  }

  return (
    <div
      className={`${props.originalSize ? "w-40 h-40" : "h-full w-full"} flex items-center justify-center bg-gray-200`}
    >
      <FontAwesomeIcon icon={faImage} className="h-1/2 text-gray-400" />
    </div>
  );
}
