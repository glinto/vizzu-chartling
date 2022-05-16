import type Vizzu from 'vizzu';
import { AnimTarget, Config } from 'vizzu';

export interface ChartlingOptions {
	base?: Chartling | string;
}

interface ControllerState {
	chartClass: typeof Vizzu;
	chart?: Vizzu;
	queue: (number | Config.Chart | AnimTarget)[];
}

export class Controller {

	static state: ControllerState;

	static push(config: number | Config.Chart | AnimTarget) {
		Controller.state.queue.push(config);
	}

}

export class Chartling {

	/**
	 * The base chartling which needs to be played before this chartling. If this chartling
	 * does not require a base chartling, this property will be explicitly set to null.
	 * Chartlings without a base play their configuration from a clean sheet
	 */
	//base: Chartling | null;

	/**
	 * The html element which contains the chartling.
	 */
	container: HTMLDivElement;

	/**
	 * A shorthand of the singleton chart instance of the chartlings
	 */
	private chart: Vizzu;

	constructor(container: HTMLDivElement | string, options?: ChartlingOptions) {
		if (Controller.state === undefined) {
			throw new Error('Chartling.use(vizzuClass) must be called before creating a Chartling instance.');
		}

		let elem = this.getElement<HTMLDivElement>(container, 'DIV');
		if (elem === null) {
			throw new Error('Container element not found or is not a div element.');
		}
		this.container = elem;


		if (Controller.state.chart === undefined) {
			// If we do not yet have a chart instance, create one 
			// and put it temporarily in a template element
			let template = document.createElement("template");
			let div = document.createElement("div");
			template.appendChild(div);
			console.log(template);
			Controller.state.chart = new Controller.state.chartClass(div);
		}
		this.chart = Controller.state.chart;
		// Generate a unique id for the container if it does not have one
		if (this.container.id === '') {
			this.container.id = "chartling-" + Math.random().toString(36).slice(2);
		}

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
		Controller.push({ data: value });
	}

	/**
	 * Provide a Vizzu class reference which the Chartling class would use. 
	 * 
	 * @param vizzuClass The Vizzu class reference
	 */
	static use(vizzuClass: typeof Vizzu) {
		// Subsequent calls will be ignored
		if (Controller.state === undefined) {
			Controller.state = {
				chartClass: vizzuClass,
				queue: []
			};
		}

	}
}
