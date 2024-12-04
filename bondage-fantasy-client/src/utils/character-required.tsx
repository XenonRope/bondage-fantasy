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
    // Check if character is selected only at the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return character ? <Outlet /> : <></>;
}
