import type Vizzu from 'vizzu';

export interface ChartlingOptions {
	base?: Chartling | string | HTMLDivElement;
	id?: string;
}

export class Chartling {

	private static vizzuClass: typeof Vizzu;
	private static vizzuInstance: Vizzu;

	constructor(container: HTMLDivElement | string, options?: ChartlingOptions) {
		if (Chartling.vizzuClass === undefined) {
			throw new Error('Chartling.use(vizzuClass) must be called before creating a Chartling instance.');
		}
		if (Chartling.vizzuInstance === undefined) {
			// Create a template element in the conatiner's document
			let template = document.createElement("template");
			let div = document.createElement("div");
			template.appendChild(div);
			console.log(template);
			Chartling.vizzuInstance = new Chartling.vizzuClass(div);
		}
	}

	/**
	 * Provide a Vizzu class reference to use for creating Chartling instances.
	 * 
	 * @param vizzuClass The Vizzu class which the new chartlings will use as their parent
	 */
	static use(vizzuClass: typeof Vizzu) {
		Chartling.vizzuClass = vizzuClass;
	}
}
