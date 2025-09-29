import axios from '@/config/app';

export default class CalendarService {
    /**
     * @param {string|Date} startAt
     * @param {string|Date} endAt
     * @param {null|number|number[]} projectId
     */
    get(startAt, endAt, projectId = null) {
        return axios.post('tasks/calendar', { start_at: startAt, end_at: endAt, project_id: projectId });
    }
}
