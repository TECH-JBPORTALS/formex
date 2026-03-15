import { renderToStaticMarkup } from "react-dom/server";
import { Format01, type VisionMission } from "./format01";

export function renderFormat01(data: VisionMission) {
  return renderToStaticMarkup(<Format01 data={data} />);
}
