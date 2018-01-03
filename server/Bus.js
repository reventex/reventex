import { connect } from 'nats';

export function Bus(config) {
    return connect(config);
}
