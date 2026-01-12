// services/doctorApi.js
import api from './api';

export const doctorApi = {
  // Get all doctors
  getDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Get doctor schedule
  getDoctorSchedule: async (doctorId, date) => {
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/doctors/${doctorId}/schedule?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      throw error;
    }
  },

  // Export schedule
  exportSchedule: async (doctorId, startDate, endDate) => {
    try {
      const response = await api.get(
        `/doctors/${doctorId}/schedule/export?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting schedule:', error);
      throw error;
    }
  },

  // Get doctor details
  getDoctorById: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  }
};