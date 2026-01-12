// services/appointmentApi.js
import api from './api';

export const appointmentApi = {
  // Create appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }
};