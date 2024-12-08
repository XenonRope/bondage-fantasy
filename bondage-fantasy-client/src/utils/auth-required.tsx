import { useAppStore } from "../store";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

export function AuthRequired() {
  const navigate = useNavigate();
  const sessionRestoreCompleted = useAppStore(
    (state) => state.sessionInitialized,
  );
  const account = useAppStore((state) => state.account);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized && sessionRestoreCompleted) {
      if (!account) {
        navigate("/login");
      }
      setInitialized(true);
    }
  }, [account, sessionRestoreCompleted, initialized, navigate]);

  return sessionRestoreCompleted && account ? <Outlet /> : <></>;
}
