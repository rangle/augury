export const NAMESPACE = 'change-detection-profiler';
const _getState = (store: any): ChangeDetectionProfilerState => store[NAMESPACE];

export interface ChangeDetectionProfilerState {
  ticks: Array<any>;
  taskQueue: Array<any>;
  cyclesPerSecond: number;
}

export const INITIAL_STATE: ChangeDetectionProfilerState = {
  ticks: [],
  taskQueue: [],
  cyclesPerSecond: 0
};

export class ChangeDetectionProfilerSelectors {
  static ticks
    = (store) => _getState(store).ticks
  static cyclesPerSecond
    = (store) => _getState(store).cyclesPerSecond
  static taskQueue
    = (store) => _getState(store).taskQueue
}

export class ChangeDetectionProfilerUpdaters {

  static addTick = (tick) =>
    (state: ChangeDetectionProfilerState): ChangeDetectionProfilerState =>
      merge(state, {
        ticks: state.ticks.concat(tick).sort((t1, t2) => t1.start_time - t2.start_time) })

  static updateCyclesPerSecond = (cyclesPerSecond) =>
    (state: ChangeDetectionProfilerState): ChangeDetectionProfilerState =>
      merge(state, { cyclesPerSecond })

  static updateTaskQueue = (queue) =>
    (state: ChangeDetectionProfilerState): ChangeDetectionProfilerState =>
      merge(state, { taskQueue: queue })

}

const merge = (...objs) => Object.assign({}, ...objs);
