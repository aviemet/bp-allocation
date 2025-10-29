declare module "meteor/mdg:validated-method" {
	import { Meteor } from "meteor/meteor"

	export interface ValidatedMethodOptions<TArgs = unknown, TResult = unknown> {
		name: string
		validate?: ((args: TArgs) => void) | null
		mixins?: unknown[]
		applyOptions?: {
			returnStubValue?: boolean
			throwStubExceptions?: boolean
			noRetry?: boolean
			onResultReceived?: (result: TResult) => void
		}
		run: (args: TArgs) => TResult
	}

	export class ValidatedMethod<TArgs = unknown, TResult = unknown> {
		constructor(options: ValidatedMethodOptions<TArgs, TResult>);

		call(args: TArgs, callback?: (error: Meteor.Error | null, result?: TResult) => void): TResult;
		callAsync(args: TArgs): Promise<TResult>;
		_execute(context: { userId?: string }, args: TArgs): TResult;
	}
}
