import moment from 'moment-timezone';
import TasksService from '@/services/resource/task.service';
import UserService from '@/services/resource/user.service';
import DashboardService from '_internal/Dashboard/services/dashboard.service';
import _ from 'lodash';
import Vue from 'vue';

const state = {
    service: null,
    intervals: {},
    tasks: {},
    users: [],
    timezone: moment.tz.guess(),
};

const getters = {
    service: state => state.service,
    intervals: state => state.intervals,
    tasks: state => state.tasks,
    users: state => state.users,
    timePerProject: (state, getters) => {
        return Object.keys(getters.intervals).reduce((result, userID) => {
            const userEvents = getters.intervals[userID];
            if (!userEvents) {
                return result;
            }

            const projects = userEvents.reduce((projects, event) => {
                if (!projects[event.project_id]) {
                    projects[event.project_id] = {
                        id: event.project_id,
                        name: event.project_name,
                        duration: event.duration,
                        tasks: {},
                        durationAtSelectedPeriod: event.durationAtSelectedPeriod,
                    };
                } else {
                    projects[event.project_id].duration += event.duration;
                    projects[event.project_id].durationAtSelectedPeriod += event.durationAtSelectedPeriod;
                }

                if (!projects[event.project_id].tasks[event.task_id]) {
                    projects[event.project_id].tasks[event.task_id] = {
                        id: event.task_id,
                        name: event.task_name,
                        duration: event.duration,
                        durationAtSelectedPeriod: event.durationAtSelectedPeriod,
                    };
                } else {
                    projects[event.project_id].tasks[event.task_id].duration += event.duration;
                    projects[event.project_id].tasks[event.task_id].durationAtSelectedPeriod +=
                        event.durationAtSelectedPeriod;
                }

                return projects;
            }, {});

            return {
                ...result,
                [userID]: projects,
            };
        }, {});
    },
    timePerDay: (state, getters) => {
        return Object.keys(getters.intervals).reduce((result, userID) => {
            const userEvents = getters.intervals[userID];
            if (!userEvents) {
                return result;
            }

            const userTimePerDay = userEvents.reduce((result, event) => {
                return _.mergeWith({}, result, event.durationByDay, _.add);
            }, {});

            return {
                ...result,
                [userID]: userTimePerDay,
            };
        }, {});
    },
    timezone: state => state.timezone,
};

const mutations = {
    setService(state, service) {
        state.service = service;
    },
    setIntervals(state, intervals) {
        state.intervals = intervals;
    },
    addInterval(state, interval) {
        if (Array.isArray(state.intervals)) {
            state.intervals = {};
        }

        if (!Object.prototype.hasOwnProperty.call(state.intervals, interval.user_id)) {
            Vue.set(state.intervals, interval.user_id, []);
        }

        state.intervals[interval.user_id].push(interval);
    },
    updateInterval(state, interval) {
        if (!Object.prototype.hasOwnProperty.call(state.intervals, interval.user_id)) {
            return;
        }

        const index = state.intervals[interval.user_id].findIndex(item => +item.id === +interval.id);
        if (index !== -1) {
            state.intervals[interval.user_id].splice(index, 1, interval);
        }
    },
    removeInterval(state, interval) {
        if (!Object.prototype.hasOwnProperty.call(state.intervals, interval.user_id)) {
            return;
        }

        const index = state.intervals[interval.user_id].findIndex(item => +item.id === +interval.id);
        if (index !== -1) {
            state.intervals[interval.user_id].splice(index, 1);
        }
    },
    removeIntervalById(state, id) {
        for (const userId in state.intervals) {
            const index = state.intervals[userId].findIndex(item => +item.id === +id);
            if (index !== -1) {
                state.intervals[userId].splice(index, 1);
                break;
            }
        }
    },
    setTasks(state, tasks) {
        state.tasks = tasks;
    },
    setUsers(state, users) {
        state.users = users;
    },
    setTimezone(state, timezone) {
        state.timezone = timezone;
    },
};

const actions = {
    init(context) {
        context.commit('setService', new DashboardService(context, new TasksService(), new UserService()));
    },
};

export default {
    state,
    getters,
    mutations,
    actions,
};
