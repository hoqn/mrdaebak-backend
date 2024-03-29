import AppConfig from "@/config";

import { Order } from "@/model/entity";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

enum StaffEvents {
    NEW_ORDER = 'NEW_ORDER',
}

@WebSocketGateway(AppConfig.socketPort, {
    transports: ['websocket', 'polling'],
    namespace: 'staff',
    cors: true,
    allowEIO3: true,
})
export class StaffAlarmEventGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor() {
        console.log('Socket io in PORT ', AppConfig.socketPort);
    }

    private clients: Socket[] = [];

    public async notifyNewOrder(order: Order) {
        this.server.emit(StaffEvents.NEW_ORDER, order);
    }

    handleConnection(client: Socket, ...args: any[]) {
        if (process.env.NODE_ENV === 'development')
            console.log(`${client.id} has connected.`);
        this.clients.push(client);
    }

    handleDisconnect(client: Socket) {
        if (process.env.NODE_ENV === 'development')
            console.log(`${client.id} has disconnected.`);
        this.clients.splice(this.clients.findIndex(c => c.id === client.id), 1);
    }
}