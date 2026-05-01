import {json} from '@sveltejs/kit';
import {loadTraces} from '$lib/server/traces';

export async function GET(){

return json(
 await loadTraces()
);

}