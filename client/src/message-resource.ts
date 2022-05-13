import {buildResource} from './resource';

export const resource = buildResource(5000, {value: 'This is coming from server!'}, 'message');
