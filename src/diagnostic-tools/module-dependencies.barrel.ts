export { Options, SimpleOptions } from 'frontend/state/options'; // backend and frontend use locally option to enable/disable

export { send } from 'backend/indirect-connection'; // backend sends diagnostic packages to frontend

export { MessageFactory } from 'communication/message-factory';
export { create } from 'communication/message-create';
export { MessageType } from 'communication/message-type';
export { Message, MessageResponse, Serialize } from 'communication/message';

export { Connection } from 'frontend/channel'; // frontend sends some messages to backend

export { buildConfig } from '../build.config';
