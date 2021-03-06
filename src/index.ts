import type Vizzu from 'vizzu';
import { AnimTarget, Config } from 'vizzu';

export interface ChartlingOptions {
	base?: Chartling | string;
}

export interface ChartlingAnim {
	chartling: Chartling;
	anim: number | Config.Chart | AnimTarget;
}

export class Controller {

	private static _instance: Controller;
	chartClass?: typeof Vizzu;
	chart?: Vizzu;
	queue: ChartlingAnim[] = [];
	chartlings: Map<string, Chartling> = new Map();
	busy = false;

	static get instance(): Controller {
		if (!Controller._instance) {
			Controller._instance = new Controller();
		}
		return Controller._instance;
	}

	add(chartling: Chartling) {
		this.chartlings.set(chartling.container.id, chartling);
	}

	/**
	 * Provide a Vizzu class reference which the Chartling class would use. 
	 * 
	 * @param vizzuClass The Vizzu class reference
	 */
	use(vizzuClass: typeof Vizzu) {
		// Subsequent calls will be ignored
		if (this.chartClass === undefined) {
			this.chartClass = vizzuClass;

			// If we do not yet have a chart instance, create one 
			// and put it temporarily in a template element
			let template = document.createElement("template");
			let div = document.createElement("div");
			template.appendChild(div);
			console.log(template);
			this.chart = new this.chartClass(div);
		}

	}

	/**
	 * Push a new chartling animation to the queue.
	 * @param anim A chartling animation object to play
	 */

	push(anim: ChartlingAnim) {
		this.queue.push(anim);
		this.play();
	}

	play() {
		// Do nothing if the controller is busy
		if (this.busy) return;
		if (this.chart === undefined) return;
		if (this.queue.length === 0) return;
		// Anim is not based on another chartling,
		// se we can just reset and animat ethe chart
		if (this.queue[0].chartling.base === null) {
			this.chart.initializing.then(() => {
				this.chart?.animate(this.queue[0].anim);
			});
		};
	}




}

export class Chartling {

	/**
	 * The base chartling which needs to be played before this chartling. If this chartling
	 * does not require a base chartling, this property will be explicitly set to null.
	 * Chartlings without a base play their configuration from a clean sheet
	 */
	base: Chartling | null;

	/**
	 * The html element which contains the chartling.
	 */
	container: HTMLDivElement;

	/**
	 * A shorthand of the singleton chart instance of the chartlings
	 */
	private chart: Vizzu;

	constructor(container: HTMLDivElement | string, options?: ChartlingOptions) {
		if (Controller.instance.chartClass === undefined) {
			throw new Error('Chartling.use(vizzuClass) must be called before creating a Chartling instance.');
		}

		let elem = this.getElement<HTMLDivElement>(container, 'DIV');
		if (elem === null) {
			throw new Error('Container element not found or is not a div element.');
		}
		this.container = elem;

		// set up base reference
		this.base = null;
		if (options?.base !== undefined) {
			if (typeof options?.base === "string") {
				this.base = Controller.instance.chartlings.get(options.base) || null;
			}
			else if (options?.base instanceof Chartling) {
				this.base = options.base;
			}
		}

		if (Controller.instance.chart === undefined) {
			throw new Error('Chartling.use(vizzuClass) must be called before creating a Chartling instance.');
		}
		this.chart = Controller.instance.chart;
		// Generate a unique id for the container if it does not have one
		if (this.container.id === '') {
			this.container.id = "chartling-" + Math.random().toString(36).slice(2);
		}

		Controller.instance.add(this);


	}

	/**
	 * Gets an Element instance by instance or id, optionally constrained by a given tag name.
	 * 
	 * @param element An element instance or an element selector string
	 * @param tagName A tag constraint for the element
	 * @returns an Element instance or null if not found, or the tag constraint is not met
	 */
	private getElement<T extends Element>(element: T | string, tagName?: string): T | null {
		if (typeof element === 'string') {
			let elem = document.querySelector<T>(element);
			// element not found
			if (elem === null) {
				return null;
			}
			// tag constraint not met
			if (tagName !== undefined && elem.tagName !== tagName) {
				return null;
			}
			return elem;
		}
		// tag constraint not met
		else if (tagName !== undefined && element.tagName !== tagName) {
			return null;
		}
		else {
			return element;
		}
	}


	set data(value: any) {
		Controller.instance.push({ chartling: this, anim: { data: value } });
	}

	/**
	 * Provide a Vizzu class reference which the Chartling class would use. 
	 * 
	 * @param vizzuClass The Vizzu class reference
	 */
	static use(vizzuClass: typeof Vizzu) {
		Controller.instance.use(vizzuClass);
	}

}
