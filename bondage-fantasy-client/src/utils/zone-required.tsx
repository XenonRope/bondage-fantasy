import { useAppStore } from "../store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export function ZoneRequired() {
  const navigate = useNavigate();
  const zone = useAppStore((state) => state.zone);
  useEffect(() => {
    if (!zone) {
      navigate("/zones");
    }
    // Check if character is inside zone only at the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return zone ? <Outlet /> : <></>;
}
