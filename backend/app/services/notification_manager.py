from fastapi import WebSocket


class NotificationManager:
    """Broadcast new help requests to connected helpers by role."""

    def __init__(self):
        # role ("peer" | "therapist") → list of connected WebSockets
        self.connections: dict[str, list[WebSocket]] = {}

    async def connect(self, role: str, websocket: WebSocket):
        await websocket.accept()
        if role not in self.connections:
            self.connections[role] = []
        self.connections[role].append(websocket)

    def disconnect(self, role: str, websocket: WebSocket):
        if role in self.connections:
            self.connections[role] = [
                ws for ws in self.connections[role] if ws != websocket
            ]

    async def broadcast_to_role(self, role: str, data: dict):
        """Send data to all helpers connected with the given role."""
        targets = self.connections.get(role, [])
        dead = []
        for ws in targets:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.connections[role].remove(ws)


notification_manager = NotificationManager()
