import { useAppStore } from "../store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export function CharacterRequired() {
  const navigate = useNavigate();
  const character = useAppStore((state) => state.character);
  useEffect(() => {
    if (!character) {
      navigate("/characters");
    }
  }, [character, navigate]);

  return character ? <Outlet /> : <></>;
}
