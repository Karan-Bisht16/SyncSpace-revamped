import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
// importing reducers
import { clearSocket, setSocketId } from "../reducers/socket.reducer";
// importing utils
import { logError, logMessage } from "../../../utils/log.util";

export const useSocket = () => {
    const dispatch = useDispatch();

    const [connected, setConnected] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                transports: ["websocket", "polling"],
            });
        }

        const socket = socketRef.current;

        const onConnect = () => {
            if (socket.id) {
                logMessage("Socket connected with ID:", socket.id);
                dispatch(setSocketId(socket.id));
                setConnected(true);
            }
        };

        const onDisconnect = () => {
            logMessage("Socket disconnected");
            setConnected(false);
            dispatch(clearSocket());
        };

        const onError = (error: Error) => {
            logError("Socket error:", error);
            setConnected(false);
            dispatch(clearSocket());
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onError);
            socket.disconnect();
        };
    }, []);

    return {
        socket: socketRef.current,
        connected,
    };
};