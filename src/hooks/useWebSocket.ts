/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  options?: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
  };
}

interface WebSocketState<T = unknown> {
  socket: WebSocket | null;
  lastMessage: T | null;
  readyState: number;
  error: Event | null;
}

export function useWebSocket<T = unknown>(config: WebSocketConfig) {
  const [state, setState] = useState<WebSocketState<T>>({
    socket: null,
    lastMessage: null,
    readyState: WebSocket.CLOSED,
    error: null,
  });

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const heartbeatTimeout = useRef<NodeJS.Timeout>();

  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = config.options || {};

  const connect = () => {
    try {
      const socket = new WebSocket(config.url, config.protocols);

      socket.onopen = () => {
        setState((prev) => ({
          ...prev,
          socket,
          readyState: socket.readyState,
          error: null,
        }));
        reconnectAttempts.current = 0;

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatTimeout.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "ping" }));
            }
          }, heartbeatInterval);
        }
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          message = event.data;
        }
        setState((prev) => ({ ...prev, lastMessage: message }));
      };

      socket.onclose = () => {
        setState((prev) => ({ ...prev, readyState: socket.readyState }));

        if (heartbeatTimeout.current) {
          clearInterval(heartbeatTimeout.current);
        }

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(connect, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        setState((prev) => ({ ...prev, error, readyState: socket.readyState }));
      };
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as Event }));
    }
  };

  const disconnect = () => {
    if (state.socket) {
      state.socket.close();
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (heartbeatTimeout.current) {
      clearInterval(heartbeatTimeout.current);
    }
  };

  const sendMessage = (message: unknown) => {
    if (state.socket && state.readyState === WebSocket.OPEN) {
      const data =
        typeof message === "string" ? message : JSON.stringify(message);
      state.socket.send(data);
      return true;
    }
    return false;
  };

  useEffect(() => {
    connect();
    return disconnect;
  }, [config.url]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    isConnecting: state.readyState === WebSocket.CONNECTING,
    isConnected: state.readyState === WebSocket.OPEN,
    isDisconnected: state.readyState === WebSocket.CLOSED,
  };
}
