import { useAppStore } from "../store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export function ZoneOrSceneRequired() {
  const navigate = useNavigate();
  const zone = useAppStore((state) => state.zone);
  const scene = useAppStore((state) => state.scene);
  useEffect(() => {
    if (!zone && !scene) {
      navigate("/zones");
    }
  }, [zone, scene, navigate]);

  return zone || scene ? <Outlet /> : <></>;
}
