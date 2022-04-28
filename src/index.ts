import Vizzu, { Anim } from "vizzu";

var chartInstance: Vizzu;

export interface ChartlingOptions {
	base?: Chartling | string | HTMLDivElement;
	id?: string;
}

export class Chartling {

	constructor(container: HTMLDivElement, options?: ChartlingOptions) {
		if (chartInstance === undefined) {
			// Create a template element in the conatiner's document
			let template = document.createElement("template");
			let div = document.createElement("div");
			template.appendChild(div);
			chartInstance = new Vizzu(div);
		}
	}

	get chart(): Vizzu {
		return chartInstance;
	}
}
