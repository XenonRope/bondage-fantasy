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
  }, [zone, navigate]);

  return zone ? <Outlet /> : <></>;
}
