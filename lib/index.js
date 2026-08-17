// Host-side entry for the browser-only board UI plugin.
// The client-modules node half needs a live loader fiber (an entry whose
// apply() starts cleanly) to qualify this package as a dsh.client plugin;
// everything real happens in the browser bundle (./client).
export function apply() {}
