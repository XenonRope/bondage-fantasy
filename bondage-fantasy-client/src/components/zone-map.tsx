import { ZONE_MAX_HEIGHT, ZONE_MAX_WIDTH } from "bondage-fantasy-common";

export function ZoneMap() {
  return (
    <div className="flex flex-col gap-[32px] w-fit">
      {[...Array(ZONE_MAX_HEIGHT).keys()].map((y) => (
        <div key={y} className="flex flex-row gap-[32px]">
          {[...Array(ZONE_MAX_WIDTH).keys()].map((x) => (
            <div
              key={x}
              className="w-[64px] h-[64px] bg-gray-100 hover:bg-gray-200"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
