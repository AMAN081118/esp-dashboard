import { useMemo } from "react";

export type MachineState = "Off" | "Idle" | "Traversing" | "Machining Active";

export function useMachineState(
  rpm: number,
  encoder: number,
  vibration: number,
) {
  // BASIC CLASSIFICATION LOGIC
  // Spindle = Off → Lathe is Off
  // Spindle = On, No Tool Movement + No Vibration → Idle
  // Spindle = On, Tool Moving, No Vibration → Traversing
  // Spindle = On, Tool Moving, Vibration Present → Machining Active
  return useMemo<MachineState>(() => {
    if (!rpm || rpm === 0) return "Off";
    if (rpm > 0 && encoder === 0 && vibration === 0) return "Idle";
    if (rpm > 0 && encoder > 0 && vibration === 0) return "Traversing";
    if (rpm > 0 && encoder > 0 && vibration > 0) return "Machining Active";
    return "Off";
  }, [rpm, encoder, vibration]);
}
