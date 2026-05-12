import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useVehicleStore from '../store/useVehicleStore';
import useAlertStore from '../store/useAlertStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocket = () => {
  const socketRef = useRef(null);
  const updateVehiclePosition = useVehicleStore((s) => s.updateVehiclePosition);
  const addAlert = useAlertStore((s) => s.addAlert);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to KMC SwachthTrack');
      socket.emit('join:dashboard');
    });
    socket.on('vehicle:update', (data) => { updateVehiclePosition(data); });
    socket.on('alert:new', (alert) => { addAlert(alert); });
    socket.on('disconnect', () => { console.log('❌ Socket disconnected'); });

    return () => { socket.disconnect(); };
  }, []);

  const trackVehicle = useCallback((vehicleId) => { socketRef.current?.emit('track:vehicle', vehicleId); }, []);
  const untrackVehicle = useCallback((vehicleId) => { socketRef.current?.emit('untrack:vehicle', vehicleId); }, []);

  return { socket: socketRef.current, trackVehicle, untrackVehicle };
};

export default useSocket;
