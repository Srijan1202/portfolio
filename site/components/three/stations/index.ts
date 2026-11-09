import { PhoneStation } from "./Phone";
import { RaspberryPiStation } from "./RaspberryPi";
import { Esp32Station } from "./Esp32";
import { L1L2StackStation } from "./L1L2Stack";

/** Station object name (content/projects.ts) → its 3D component. */
export const STATIONS = {
  phone: PhoneStation,
  "raspberry-pi": RaspberryPiStation,
  esp32: Esp32Station,
  "l1-l2-stack": L1L2StackStation,
} as const;
