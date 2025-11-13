# Publication Testing

**Note**: These publications cannot be tested on the server side using `Meteor.subscribe()` because subscriptions are client-only.

To properly test that publications:
1. Call `added()` before `ready()` 
2. Ensure data is synced when `ready()` is called
3. Prevent reading data before `ready()` is true

Tests should be written as **client-side integration tests** that:
- Create a DDP connection
- Subscribe to the publication
- Verify data exists in collections when `subscription.ready()` is true
- Verify data cannot be read before `subscription.ready()` is true

Alternatively, publications can be tested by:
- Directly calling the publication function with a mock publication object
- Verifying the mock's `added()` is called before `ready()`

The current implementation ensures publications:
- Fetch initial data with `fetchAsync()`
- Publish it synchronously using `observerCallbacks.added()`
- Then set up observers for future changes
- Only then call `this.ready()`

This guarantees `subscription.ready()` means data is actually synced to the client.

