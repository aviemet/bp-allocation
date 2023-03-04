import { type SvgIconTypeMap } from "@mui/material";
import { type OverridableComponent } from "@mui/material/OverridableComponent";

declare global {
	type Icon = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
		muiName: string;
	}
}